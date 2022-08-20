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
	var item = make_item(ore_name, "ore");
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
	
	fill_asteroid(obj, "Titanium", "titanium", 15);
	
	return obj;
}

function get_asteroid_description(asteroid)
{
	var largest_ore_amount = 0;
	var largest_ore_index = 0;
	
	if(asteroid.ores.length == 0)
		return "Barren";
	
	for(var i=0; i < asteroid.ores.length; i++)
	{
		if(asteroid.ores[i].ore_amount >= largest_ore_amount)
		{
			largest_ore_amount = asteroid.ores[i].ore_amount;
			largest_ore_index = i;
		}
	}
	
	var largest_ore = asteroid.ores[largest_ore_index];
	
	return largest_ore.name + " (" + largest_ore.ore_amount + ")";
}

function make_ship(position, ship_name)
{
	var obj = make_object_with_position(position);
	obj.name = "Ship";
	obj.type = "ship";
	obj.nickname = ship_name;
	
	return obj;
}

function make_station(position, station_name)
{
	var obj = make_object_with_position(position);
	obj.name = "Station";
	obj.type = "station";
	obj.nickname = station_name;
	
	return obj;
}

///takes a 1d array, pads to longest
function format(arr)
{
	var max_length = 0;
	
	for(var i=0; i < arr.length; i++)
	{
		max_length = Math.max(arr[i].length, max_length);
	}
	
	var result = [];
	result.length = arr.length;
	
	for(var i=0; i < arr.length; i++)
	{
		var str = arr[i];
		
		str = str.padEnd(max_length, ' ');
		
		result[i] = str;
	}
	
	return result
}

function array_concat(a1, a2, sep)
{
	var r = [];
	
	for(var i=0; i < a1.length; i++)
	{
		r.push(a1[i] + sep + a2[i]);
	}
	
	return r;
}

var objs = [
	make_ship([50, 40], "Stinky Names"),
	make_ship([100, 20], "Also A Ship"),
	make_asteroid([150, 10]),
	make_asteroid([300, 10]),
	make_station([5, 223], "Owo station"),
	make_station([10, 9], "Stationary")
];

var types = [];
var names = [];
var positions = [];

for(var e of objs)
{
	types.push(e.name);
	
	if(e.type == "ship")
	{
		names.push("(\"" + e.nickname + "\")");
	}
	else if(e.type == "asteroid")
	{
		names.push(get_asteroid_description(e));
		//names.push("(" + e.asteroid_type + ")");
	}
	else if(e.type == "station")
	{
		names.push("(\"" + e.nickname + "\")");
	}
	
	positions.push("[" + e.position[0] + ", " + e.position[1] + "]");
}

types.unshift("Name");
names.unshift("Nickname");
positions.unshift("Position");

var fmt_1 = format(types);
var fmt_2 = format(names);
var fmt_3 = format(positions);

var merged = array_concat(array_concat(fmt_1, fmt_2, ' | '), fmt_3, ' | ');

merged.join('\n');