#include <iostream>
#include <networking/networking.hpp>

struct client_state
{

};

int main()
{
    connection_settings sett;

    connection conn;
    conn.host("0.0.0.0", 6600, connection_type::SSL, sett);

    std::cout << "Hosted\n";

    connection_received_data recv;
    connection_send_data send(sett);

    std::map<uint64_t, client_state> state;

    while(1)
    {
        conn.receive_bulk(recv);

        for(auto i : recv.new_clients)
        {
            state[i] = client_state();

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
