function make_object(position)
{
	var obj = {};
	obj.position = position;
	
	return obj;
}

function make_asteroid(position, type)
{
	var obj = make_object(position);
	obj.name = "Asteroid";
	obj.type = "asteroid";
	obj.asteroid_type = type;
	
	return obj;
}

function make_ship(position, ship_name)
{
	var obj = make_object(position);
	obj.name = "Ship";
	obj.type = "ship";
	obj.nickname = ship_name;
	
	return obj;
}

function make_station(position, station_name)
{
	var obj = make_object(position);
	obj.name = "Station";
	obj.type = "station";
	obj.nickname = station_name;
	
	return obj;
}

function format_entity(e)
{
	if(e.type == "ship")
	{
		return e.name + " (\"" + e.nickname + "\")";
	}
	else if(e.type == "asteroid")
	{
		return e.name + " (" + e.asteroid_type + ")";
	}
	else if(e.type == "station")
	{
		return e.name + " (\"" + e.nickname + "\")";
	}
	
	return "Error";
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

function array_concat(a1, a2)
{
	var r = [];
	
	for(var i=0; i < a1.length; i++)
	{
		r.push(a1[i] + a2[i]);
	}
	
	return r;
}

var objs = [
	make_ship([50, 40], "Stinky Names"),
	make_ship([100, 20], "Also A Ship"),
	make_asteroid([150, 10], "Ironing"),
	make_asteroid([300, 10], "Flytanium"),
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
		names.push(" (\"" + e.nickname + "\")");
	}
	else if(e.type == "asteroid")
	{
		names.push(" (" + e.asteroid_type + ")");
	}
	else if(e.type == "station")
	{
		names.push(" (\"" + e.nickname + "\")");
	}
	
	positions.push(" [" + e.position[0] + ", " + e.position[1] + "]");
}

var fmt_1 = format(types);
var fmt_2 = format(names);
var fmt_3 = format(positions);

var merged = array_concat(array_concat(fmt_1, fmt_2), fmt_3);

merged.join('\n');