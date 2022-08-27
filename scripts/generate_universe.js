// @ts-check

//mexec("universe")
import {make_poi} from "poi"
import {make_asteroid, make_station, make_warp_gate, make_ship} from "object";
import {make_universe} from "universe"
import {make_system, connect_systems} from "system"

export function generate_universe(player)
{
	var poi = make_poi("Asteroid Belt", "asteroidbelt", [20, 30]);

	var owned_ship = make_ship([150, 10.1], "Stinky Names");

	///aint great
	//player.take_ownership(owned_ship);

	player.take_ownership(poi.take(owned_ship));

	poi.take(make_ship([100, 20], "Also A Ship"));
	poi.take(make_asteroid([150, 10]));
	poi.take(make_asteroid([300, 10]));
	player.take_ownership(poi.take(make_station([151, 10.2], "Test Station")));
	poi.take(make_station([10, 9], "Stationary"));

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