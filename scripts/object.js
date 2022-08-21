exec("action");

function make_object_with_position(position)
{
	var obj = {};
	obj.position = position;
	
	return obj;
}

function make_item(name, subtype)
{
	var obj = {};
	obj.name = name;
	obj.type = "item";
	obj.subtype = subtype;
	
	return obj;
}

function fill_asteroid(asteroid, ore_name, ore_type, ore_amount)
{
	var item = make_item("Ore", "ore");
	item.ore_name = ore_name;
	item.ore_type = ore_type;
	item.ore_amount = ore_amount;
	
	asteroid.ores.push(item);
}

function make_asteroid(position)
{
	var obj = make_object_with_position(position);
	obj.name = "Asteroid";
	obj.type = "asteroid";
	obj.ores = [];
	obj.owner = -1;
	
	make_entity_actionable(obj);
	
	fill_asteroid(obj, "Titanium", "titanium", 15);
	
	return obj;
}

function make_station(position, station_name)
{
	var obj = make_object_with_position(position);
	obj.name = "Station";
	obj.type = "station";
	obj.nickname = station_name;
	obj.owner = -1;
	
	make_entity_actionable(obj);
	
	return obj;
}

function make_warp_gate(src_sys, dest_sys)
{
	var obj = make_object_with_position([0, 0]);
	obj.name = "Warp Gate";
	obj.type = "warpgate";
	obj.nickname = dest_sys.system_name;
	obj.dest_uid = dest_sys.uid;
	obj.src_uid = src_sys.uid;
	obj.owner = -1;
	
	make_entity_actionable(obj);
	
	return obj;
}

function make_ship(position, ship_name)
{
	var obj = make_object_with_position(position);
	obj.name = "Ship";
	obj.type = "ship";
	obj.nickname = ship_name;
	obj.owner = -1;
	
	make_entity_actionable(obj);
	
	return obj;
}