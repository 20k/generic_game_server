#include <iostream>
#include <networking/networking.hpp>

#include <boost/fiber/all.hpp>
#include <boost/fiber/algo/round_robin.hpp>
#include <queue>
#include <SFML/System/Sleep.hpp>
#include <atomic>
#include <deque>
#include <SFML/System/Clock.hpp>

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
};

void execute_client_logic(std::shared_ptr<client_state> state, nlohmann::json client_msg)
{
    if(client_msg.count("type") == 0)
        return;

    if(client_msg.count("msg") == 0)
        return;

    std::string msg = client_msg["msg"];

    nlohmann::json response;
    response["type"] = 0;
    response["msg"] = msg;

    state->to_client.push(response);
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

    while(1)
    {
        conn.receive_bulk(recv);

        for(auto i : recv.new_clients)
        {
            state[i] = std::make_shared<client_state>();

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

                    state[id]->clk.restart();

                    get_global_fiber_queue().add(execute_client_logic, state[id], data);
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

                    std::cout << "Elapsed ms " << elapsed << std::endl;

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
