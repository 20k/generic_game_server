#include <iostream>
#include <networking/networking.hpp>

#include <boost/fiber/all.hpp>
#include <boost/fiber/algo/round_robin.hpp>
#include <queue>
#include <SFML/System/Sleep.hpp>
#include <atomic>
#include <deque>
#include <SFML/System/Clock.hpp>
#include <toolkit/fs_helpers.hpp>
#include <quickjs_cpp/quickjs_cpp.hpp>
#include <js_imgui/js_imgui.hpp>
#include <networking/serialisable_msgpack.hpp>
#include <cpp_lmdb/cpp_lmdb.hpp>

namespace js = js_quickjs;

#define SCRIPT_THREADS 3

template<typename T>
struct async_queue
{
    std::mutex mut;
    std::vector<T> data;

    void push(const T& d)
    {
        std::lock_guard guard(mut);
        data.push_back(d);
    }

    bool has_front()
    {
        std::lock_guard guard(mut);
        return data.size() > 0;
    }

    T pop_front()
    {
        std::lock_guard guard(mut);
        T val = data.front();
        data.erase(data.begin());
        return val;
    }
};

struct fiber_queue
{
    std::vector<std::function<void()>> q;
    std::mutex lock;

    template<typename T, typename... U>
    void add(T&& t, U&&... u)
    {
        std::lock_guard guard(lock);

        q.push_back(std::bind(t, std::forward<U>(u)...));
    }
};

inline
fiber_queue& get_global_fiber_queue()
{
    static fiber_queue q;
    return q;
}

inline
fiber_queue& get_noncritical_fiber_queue()
{
    static fiber_queue q;
    return q;
}

struct scheduler_data
{
    std::deque<boost::fibers::context*> q;
    std::atomic_int approx_queue_size = 0;
};

struct custom_scheduler : boost::fibers::algo::algorithm
{
    scheduler_data& dat;

    custom_scheduler(scheduler_data& _dat) :  dat(_dat)
    {

    }

    void awakened(boost::fibers::context* f) noexcept override
    {
        dat.q.push_back(f);

        dat.approx_queue_size = dat.approx_queue_size + 1;
    }

    boost::fibers::context* pick_next() noexcept override
    {
        if(dat.q.size() == 0)
            return nullptr;

        boost::fibers::context* next = dat.q.front();
        dat.q.pop_front();
        dat.approx_queue_size = dat.approx_queue_size - 1;

        return next;
    }

    bool has_ready_fibers() const noexcept override
    {
        return dat.q.size() > 0;
    }

    void suspend_until(std::chrono::steady_clock::time_point const& until) noexcept override
    {
        auto diff = until - std::chrono::steady_clock::now();

        auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(diff).count();

        if(ms >= 4)
            sf::sleep(sf::milliseconds(1));
        else
            std::this_thread::yield();
    }

    void notify() noexcept override
    {

    }
};

template<int HARDWARE_THREADS>
void worker_thread(int id, std::array<scheduler_data, HARDWARE_THREADS>* pothers, fiber_queue& fqueue)
{
    std::array<scheduler_data, HARDWARE_THREADS>& others = *pothers;

    boost::fibers::use_scheduling_algorithm<custom_scheduler>(others[id]);

    fiber_queue& queue = fqueue;

    printf("Boot fiber worker %i\n", id);

    sf::Clock last_work;

    while(1)
    {
        bool found_work = false;

        int my_size = others[id].q.size();
        bool small = true;

        if(my_size > 0)
        {
            for(int i=0; i < HARDWARE_THREADS; i++)
            {
                if(i == id)
                    continue;

                ///significant difference in thread load
                if(others[i].approx_queue_size < my_size - 3)
                    small = false;
            }
        }

        if(small)
        {
            std::lock_guard guard(queue.lock);

            if(queue.q.size() > 0)
            {
                last_work.restart();

                boost::fibers::fiber([](auto in)
                {
                    try
                    {
                        in();
                    }
                    catch(std::exception& e)
                    {
                        std::cout << "Caught exception in fibre manager" << e.what() << std::endl;
                    }
                }, queue.q[0]).detach();

                queue.q.erase(queue.q.begin());
                found_work = true;
            }
        }

        if(!found_work)
        {
            if(last_work.getElapsedTime().asSeconds() < 10)
                boost::this_fiber::yield();
            else
                boost::this_fiber::sleep_for(std::chrono::milliseconds(16));
        }
    }
}

void boot_fiber_manager()
{
    std::array<scheduler_data, SCRIPT_THREADS>* script_workers = new std::array<scheduler_data, 3>;

    for(int i=0; i < SCRIPT_THREADS; i++)
    {
        std::thread(worker_thread<SCRIPT_THREADS>, i, script_workers, std::ref(get_global_fiber_queue())).detach();
    }

    std::array<scheduler_data, 1>* server_workers = new std::array<scheduler_data, 1>;

    for(int i=0; i < 1; i++)
    {
        std::thread(worker_thread<1>, i, server_workers, std::ref(get_noncritical_fiber_queue())).detach();
    }
}

struct client_state
{
    sf::Clock clk;

    async_queue<nlohmann::json> to_client;
    std::atomic_bool is_disconnected{false};

    async_queue<nlohmann::json> client_ui_messages;
};

struct script
{
    std::string title;
    std::string contents;
};

script load_script(std::filesystem::path name)
{
    script s;
    s.title = name.stem().string();
    s.contents = file::read(name.string(), file::mode::TEXT);

    return s;
}

std::vector<script> get_scripts(const std::string& dir)
{
    std::vector<script> scripts;

    for(const auto& entry : std::filesystem::directory_iterator{dir})
    {
        std::filesystem::path name = entry.path();

        if(name.extension().string() == ".js")
        {
            scripts.push_back(load_script(name));
        }
    }

    return scripts;
}

struct sandbox
{

};

void execute_client_logic(std::shared_ptr<client_state> state, nlohmann::json client_msg)
{
    if(client_msg.count("type") == 0)
        return;

    if(client_msg.count("msg") == 0)
        return;

    std::vector<script> scripts = get_scripts("./scripts");

    std::string msg = client_msg["msg"];

    std::string result = "No script found";

    for(script& s : scripts)
    {
        if(s.title != msg)
            continue;

        sandbox sand;
        js::value_context vctx(nullptr, &sand);

        js::value found = js::eval(vctx, s.contents);

        result = (std::string)found;
    }

    nlohmann::json response;
    response["type"] = 0;
    response["msg"] = result;

    state->to_client.push(response);
}

js::value in_script_eval(js::value_context* vctx, std::string val)
{
    script s = load_script("./scripts/" + val + ".js");

    js::value result = js::eval(*vctx, s.contents);

    vctx->compact_heap_stash();

    if(result.is_error() || result.is_exception())
    {
        result = result.to_error_message();
    }

    return result;
}

std::optional<db::read_tx*> fetch_db_tx(js::value db_object)
{
    if(!db_object.has_hidden("db_transaction"))
        return std::nullopt;

    js::value hidden = db_object.get_hidden("db_transaction");

    db::read_tx* base = hidden.get_ptr<db::read_tx>();

    if(base == nullptr)
        return std::nullopt;

    return base;
}

js::value db_read(js::value_context* vctx, js::value js_db_id, js::value js_key)
{
    js::value ret(*vctx);

    int db_id = (int)js_db_id;
    std::string key = (std::string)js_key;

    std::optional tx_opt = fetch_db_tx(js::get_this(*vctx));

    if(!tx_opt.has_value())
        return js::make_value(*vctx, "No transaction in db_read");

    std::optional<db::data> dat = tx_opt.value()->read(db_id, key);

    if(dat.has_value())
    {
        std::string nullterm = (std::string)dat.value().data_view;

        ret.from_json(nullterm);
    }

    return ret;
}

js::value db_write(js::value_context* vctx, js::value js_db_id, js::value js_key, js::value js_value)
{
    int db_id = (int)js_db_id;
    std::string key = (std::string)js_key;
    std::string data = js_value.to_json();

    std::optional tx_opt = fetch_db_tx(js::get_this(*vctx));

    if(!tx_opt.has_value())
        return js::make_value(*vctx, "No transaction in db_write");

    if(!tx_opt.value()->is_read_write)
        return js::make_value(*vctx, "Tried to write on read only tx");

    db::read_write_tx* rwtx = dynamic_cast<db::read_write_tx*>(tx_opt.value());

    assert(rwtx);

    rwtx->write(db_id, key, data);

    js::value none(*vctx);
    return none;
}

js::value close_transaction_free(js::value_context* vctx, js::value called_on)
{
    if(!called_on.has_hidden("db_transaction"))
        return js::make_value(*vctx, "No hidden variable for transaction");

    js::value hidden = called_on.get_hidden("db_transaction");

    db::read_tx* base = hidden.get_ptr<db::read_tx>();

    if(base == nullptr)
        return js::make_value(*vctx, "Critical error in db_read, nullptr pointer");

    delete base;

    hidden.set_ptr(nullptr);

    called_on.del("db_transaction");

    js::value none(*vctx);
    return none;
}

js::value close_transaction(js::value_context* vctx)
{
    return close_transaction_free(vctx, js::get_this(*vctx));
}

js::value start_transaction(js::value_context* vctx, bool is_read_write)
{
    db::read_tx* base = nullptr;

    if(is_read_write)
        base = new db::read_write_tx;
    else
        base = new db::read_tx;

    js::value hidden_ptr(*vctx);
    hidden_ptr.set_ptr(base);

    js::value ret(*vctx);
    ret.add_hidden_value("db_transaction", hidden_ptr);

    js::add_key_value(ret, "read", js::function<db_read>);
    js::add_key_value(ret, "write", js::function<db_write>);
    js::add_key_value(ret, "close", js::function<close_transaction>);

    return ret;
}

js::value start_read_transaction(js::value_context* vctx)
{
    return start_transaction(vctx, false);
}

js::value start_read_write_transaction(js::value_context* vctx)
{
    return start_transaction(vctx, true);
}

void system_global(js::value_context& vctx)
{
    js::value glob = js::get_global(vctx);

    js::value db(vctx);
    js::add_key_value(db, "read_only", js::function<start_read_transaction>);
    js::add_key_value(db, "read_write", js::function<start_read_write_transaction>);

    glob["db"] = db;
}

void client_ui_thread(std::shared_ptr<client_state> state)
{
    int script_id = 0;

    shared_ui_state_base shared;

    sandbox sand;
    js::value_context vctx(nullptr, &sand);

    js::value glob = js::get_global(vctx);
    glob["exec"] = js::function<in_script_eval>;

    js_ui::startup_state(vctx, &shared, script_id);
    system_global(vctx);

    uint32_t sequence_id = 0;

    script ui_script = load_script("./scripts/ui.js");

    std::cout << "Started script\n";

    while(!state->is_disconnected)
    {
        /*JSMemoryUsage usg;
        JS_ComputeMemoryUsage(JS_GetRuntime(vctx.ctx), &usg);
        printf("Malloc size %i malloc limit %i atom count %i atom count %i\n", usg.malloc_size, usg.malloc_limit, usg.atom_count, usg.atom_size);*/

        while(state->client_ui_messages.has_front())
        {
            nlohmann::json val = state->client_ui_messages.pop_front();

            js_ui::process(val, &shared);
        }

        js_ui::pre_exec(&shared, script_id);

        js::eval(vctx, ui_script.contents);

        vctx.compact_heap_stash();

        //std::cout << (std::string)result << std::endl;

        std::optional data_opt = js_ui::post_exec(vctx, &shared, script_id, sequence_id);

        if(data_opt.has_value())
        {
            state->to_client.push(data_opt.value());
        }

        boost::this_fiber::sleep_for(std::chrono::milliseconds(16));
    }
}

int main()
{
    boot_fiber_manager();

    connection_settings sett;

    connection conn;
    conn.host("0.0.0.0", 6600, connection_type::SSL, sett);

    std::cout << "Hosted\n";

    connection_received_data recv;
    connection_send_data send(sett);

    std::map<uint64_t, std::shared_ptr<client_state>> state;

    sf::Clock time_since_last_message;

    std::vector<script> scripts = get_scripts("./scripts/on_startup");

    for(const script& s : scripts)
    {
        sandbox sand;
        js::value_context vctx(nullptr, &sand);
        system_global(vctx);

        js::eval(vctx, s.contents);
    }

    while(1)
    {
        conn.receive_bulk(recv);

        for(auto i : recv.new_clients)
        {
            state[i] = std::make_shared<client_state>();

            get_global_fiber_queue().add(client_ui_thread, state[i]);

            std::cout << "client" << std::endl;
        }

        for(auto i : recv.disconnected_clients)
        {
            auto it = state.find(i);

            if(it != state.end())
                state.erase(i);
        }

        for(auto& [id, datas] : recv.websocket_read_queue)
        {
            time_since_last_message.restart();

            try
            {
                for(const write_data& network_data : datas)
                {
                    nlohmann::json data = nlohmann::json::parse(network_data.data);

                    if(data["type"] == "client_ui_element")
                    {
                        state[id]->client_ui_messages.push(data);
                    }
                    else
                    {
                        state[id]->clk.restart();

                        get_global_fiber_queue().add(execute_client_logic, state[id], data);
                    }

                }
            }
            catch(...)
            {
                send.disconnect(id);
            }
        }

        for(auto& [id, st] : state)
        {
            while(st->to_client.has_front())
            {
                time_since_last_message.restart();

                try
                {
                    nlohmann::json js = st->to_client.pop_front();

                    write_data dat;
                    dat.id = id;
                    dat.data = js.dump();

                    double elapsed = state[id]->clk.getElapsedTime().asMicroseconds() / 1000.;

                    //std::cout << "Elapsed ms " << elapsed << std::endl;

                    send.write_to_websocket(dat);
                }
                catch(...)
                {
                    send.disconnect(id);
                }
            }
        }

        conn.send_bulk(send);

        if(time_since_last_message.getElapsedTime().asSeconds() > 5)
            sf::sleep(sf::milliseconds(1));
        else
            std::this_thread::yield();
    }

    return 0;
}
