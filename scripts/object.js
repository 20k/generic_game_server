import {make_entity_actionable} from "action" 
import {set_debug} from "debug"
import {fix_class_array} from "api"

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

function fill_asteroid(asteroid, ore_name, ore_type, ore_amount)
{
	var item = make_item("Ore", "ore");
	item.ore_name = ore_name;
	item.ore_type = ore_type;
	item.ore_amount = ore_amount;
	
	item.take_ore_amount = function(amount) {		
		if(amount > this.ore_amount) {
			amount = this.ore_amount;
		}
		
		var result = make_item("Ore", "ore");
		result.ore_name = this.ore_name;
		result.ore_type = this.ore_type;
		result.ore_amount = amount;
		
		this.ore_amount -= amount;
		
		return result;
	}
	
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
		
		make_entity_actionable(this);
	}
	
	store()
	{
		return this;
	}
	
	load(obj)
	{
		make_entity_actionable(this);
		
		Object.assign(this, obj);
		
		fix_class_array(this.actions);
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
			result.push(item.take_ore_amount(depleted_frac * item.ore_amount));
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
		
		make_entity_actionable(this);
	}
	
	store()
	{
		return this;
	}
	
	load(obj)
	{
		make_entity_actionable(this);
		
		Object.assign(this, obj);
		
		fix_class_array(this.actions);
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
		
		make_entity_actionable(this);
	}
	
	store()
	{
		return this;
	}
	
	load(obj)
	{
		make_entity_actionable(this);
		
		Object.assign(this, obj);
		
		fix_class_array(this.actions);
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
		
		make_entity_actionable(this);
	}
	
	store()
	{
		return this;
	}
	
	load(obj)
	{
		make_entity_actionable(this);
		
		Object.assign(this, obj);
		
		fix_class_array(this.actions);
		
		/*if(this.add_action_time == undefined)
		{
			set_debug("I am sad");
		}*/
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