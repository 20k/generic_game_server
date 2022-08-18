#include <iostream>
#include <networking/networking.hpp>

#include <boost/fiber/all.hpp>
#include <boost/fiber/algo/round_robin.hpp>
#include <queue>
#include <SFML/System/Sleep.hpp>
#include <atomic>
#include <deque>

#define SCRIPT_THREADS 3

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
        sf::sleep(sf::milliseconds(1));
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
            boost::this_fiber::sleep_for(std::chrono::milliseconds(1));
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

};

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
            try
            {
                for(const write_data& network_data : datas)
                {
                    nlohmann::json data = nlohmann::json::parse(network_data.data);

                    if(data.count("type") > 0 && data.count("msg") > 0 && data["type"] == 0)
                    {
                        std::string msg = data["msg"];

                        nlohmann::json out_js;
                        out_js["type"] = 0;
                        out_js["msg"] = msg;

                        write_data pong;
                        pong.id = id;
                        pong.data = out_js.dump();

                        send.write_to_websocket(pong);
                    }
                }
            }
            catch(...)
            {
                send.disconnect(id);
            }
        }

        conn.send_bulk(send);

        std::this_thread::sleep_for(std::chrono::milliseconds(1));
    }

    return 0;
}
