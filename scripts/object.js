import {set_debug} from "debug"

exec("get_unique_id");

function make_object_with_position(position)
{
	var obj = {};
	obj.position = position;
	
	return obj;
}

function make_item(name, subtype)
{	
	return {
		name:name,
		type:"item",
		subtype:subtype	
	};
}

function take_ore_amount(item, amount)
{	
	if(amount > item.ore_amount) {
		amount = this.ore_amount;
	}
	
	var result = make_item("Ore", "ore");
	result.ore_name = item.ore_name;
	result.ore_type = item.ore_type;
	result.ore_amount = amount;
	
	item.ore_amount -= amount;
	
	return result;
}

function fill_asteroid(asteroid, ore_name, ore_type, ore_amount)
{
	var item = make_item("Ore", "ore");
	item.ore_name = ore_name;
	item.ore_type = ore_type;
	item.ore_amount = ore_amount;
		
	asteroid.ores.push(item);
}

export class Asteroid
{
	constructor()
	{
		this.position = [0,0];
		this.name = "Asteroid";
		this.type = "asteroid";
		this.ores = [];
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
	
	get_total_ore() {
		var total_ore = 0;
		
		for(var e of this.ores) {
			total_ore += e.ore_amount;
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
		
		for(var item of this.ores) {
			result.push(take_ore_amount(item, depleted_frac * item.ore_amount));
		}
		
		return result;
	}
}

export class Station
{
	constructor()
	{
		this.position = [0,0];
		this.name = "Station";
		this.type = "station";
		this.nickname = "Error nick";
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

export class Warpgate
{
	constructor()
	{
		this.position = [0,0];
		this.name = "Warp Gate";
		this.type = "warpgate";
		this.nickname = "Bad Dest Name";
		this.dest_uid = -1;
		this.src_uid = -1;
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
		this.position = [0,0];
		this.name = "Ship";
		this.type = "ship";
		this.nickname = "No Nick";
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

	get_speed() {
		return 1.;
	}
	
	///per second
	get_mining_power() {
		return 1;
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

export function make_warp_gate(src_sys, dest_sys)
{
	var obj = new Warpgate();
	
	obj.nickname = dest_sys.system_name;
	obj.dest_uid = dest_sys.uid;
	obj.src_uid = src_sys.uid;
		
	return obj;
}

export function make_ship(position, ship_name)
{
	var obj = new Ship();
	obj.position = position;
	obj.nickname = ship_name;
	
	return obj;
}