// @ts-check

//mexec("universe")
import {make_poi} from "./poi"
import {make_asteroid, make_station, make_warp_gate, make_ship, add_example_components, add_example_station_components} from "./object";
import {make_universe} from "./universe"
import {make_system, connect_systems} from "./system"

export function generate_universe(player)
{
	var poi = make_poi("Asteroid Belt", "asteroidbelt", [20, 30]);

	var owned_ship = make_ship([150, 10.1], "Stinky Names");
	add_example_components(owned_ship);
	player.take_ownership(poi.take(owned_ship));

	var second_ship = make_ship([100, 20], "Also A Ship");
	add_example_components(second_ship);
	poi.take(second_ship);

	poi.take(make_asteroid([150, 10]));
	poi.take(make_asteroid([300, 10]));

	///add_example_station_components

	var station_1 = poi.take(make_station([151, 10.2], "Test Station"));
	var station_2 = poi.take(make_station([10, 9], "Stationary"));

	add_example_station_components(station_1);
	add_example_station_components(station_2);

	player.take_ownership(station_1);

	var sys1 = make_system("Alpha Blenturi", [10, 10]);
	var sys2 = make_system("Barnard's Spire", [15, 13]);

	connect_systems(sys1, sys2);

	sys1.take_poi(poi);

	var universe = make_universe();
	universe.take(sys1);
	universe.take(sys2);

	return universe;
}

undefined