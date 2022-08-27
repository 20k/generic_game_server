// @ts-check

import {set_debug} from "./debug"
import {get_unique_id} from "./get_unique_id"
import {save_uids, load_uids, store_object, load_object} from "./api"
import {Item, take_ore_amount, fill_asteroid, ItemMan} from "./item";
import {save_components, load_components, get_component_by_name, aggregate_static_component_stat} from "./component"

function make_object_with_position(position)
{
	var obj = {};
	obj.position = position;

	return obj;
}

export class Asteroid
{
	constructor()
	{
		this.position = [0,0];
		this.name = "Asteroid";
		this.type = "asteroid";
		this.cargo = new ItemMan();
		this.owner = -1;
		this.uid = get_unique_id();
	}

	store()
	{
		var cargo_uid = store_object(this.cargo);

		return {name:this.name, position:this.position, owner:this.owner, c_uid:cargo_uid};
	}

	load(obj)
	{
		this.cargo = load_object(obj.c_uid);
		this.uid = obj.uid;
		this.position = obj.position;
		this.owner = obj.owner;
	}

	get_total_ore() {
		var total_ore = 0;

		for(var e of this.cargo.stored) {
			total_ore += e.volume;
		}

		if(total_ore < 0.0001)
			return 0;

		return total_ore;
	}

	///1 power removes 1 ore
	mine(total_power) {
		var total_ore = this.get_total_ore();

		if(total_ore <= 0)
			return [];

		var result = [];

		var depleted_frac = total_power / total_ore;

		for(var item of this.cargo.stored) {
			result.push(take_ore_amount(item, depleted_frac * item.volume));
		}

		return result;
	}
}

export class Station
{
	constructor()
	{
		this.name = "Station";
		this.uid = get_unique_id();
		this.type = "station";
		this.nickname = "Error nick";
		this.owner = -1;
		this.position = [0,0];
		this.components = [];
		this.cargo = new ItemMan();
	}

	store()
	{
		var cargo_uid = store_object(this.cargo);
		var reduced_arr = save_components(this.components);

		return {name:this.name, nickname:this.nickname, owner:this.owner, position:this.position, c_uid:cargo_uid, c_reduced:reduced_arr};
	}

	load(obj)
	{
		var expanded_components = load_components(obj.c_reduced);
		var cargo = load_object(obj.c_uid);

		this.nickname = obj.nickname;
		this.owner = obj.owner;
		this.position = obj.position;
		this.components = expanded_components;
		this.cargo = cargo;
	}

	get_maximum_storage() {
		return aggregate_static_component_stat(this, "cargo", "max");
	}
}

export class Warpgate
{
	constructor()
	{
		this.position = [0,0];
		this.name = "Warp Gate";
		this.type = "warpgate";
		this.nickname = "Bad Dest Name";
		this.dst_sys_uid = -1;
		this.src_sys_uid = -1;
		this.dst_poi_uid = -1;
		this.src_poi_uid = -1;
		this.owner = -1;
		this.uid = get_unique_id();
	}

	store()
	{
		return this;
	}

	load(obj)
	{
		Object.assign(this, obj);
	}
}

export class Ship
{
	constructor()
	{
		this.name = "Ship";
		this.uid = get_unique_id();
		this.type = "ship";
		this.nickname = "No Nick";
		this.owner = -1;
		this.position = [0,0];

		this.components = [];
		this.cargo = new ItemMan();
	}

	store()
	{
		var cargo_uid = store_object(this.cargo);
		var reduced_arr = save_components(this.components);

		return {name:this.name, nickname:this.nickname, owner:this.owner, position:this.position, c_uid:cargo_uid, c_reduced:reduced_arr};
	}

	load(obj)
	{
		var expanded_components = load_components(obj.c_reduced);
		var cargo = load_object(obj.c_uid);

		this.uid = obj.uid;
		this.nickname = obj.nickname;
		this.owner = obj.owner;
		this.position = obj.position;
		this.components = expanded_components;
		this.cargo = cargo;
	}

	get_speed() {
		return 1.;
	}

	get_warp_speed() {
		return 1.;
	}

	get_warp_time() {
		return 5;
	}

	///per second
	get_mining_power() {
		return 1;
	}

	get_maximum_storage() {
		return aggregate_static_component_stat(this, "cargo", "max");
	}
}

export function make_asteroid(position)
{
	//var obj = make_object_with_position(position);
	var obj = new Asteroid();
	obj.position = position;

	fill_asteroid(obj, "Titanium", "titanium", 15);

	return obj;
}

export function make_station(position, station_name)
{
	var obj = new Station();
	obj.nickname = station_name;
	obj.position = position;

	return obj;
}

export function make_warp_gate(src_sys, src_poi, dst_sys, dst_poi)
{
	var obj = new Warpgate();

	obj.nickname = dst_sys.system_name;
	obj.dst_sys_uid = dst_sys.uid;
	obj.src_sys_uid = src_sys.uid;
	obj.dst_poi_uid = dst_poi.uid;
	obj.src_poi_uid = src_poi.uid;

	return obj;
}

export function make_ship(position, ship_name)
{
	var obj = new Ship();
	obj.position = position;
	obj.nickname = ship_name;

	return obj;
}

export function add_example_components(obj) {
	obj.components.push(get_component_by_name("cargo"));
	obj.components.push(get_component_by_name("thruster"));
	obj.components.push(get_component_by_name("warpdrive"));
}