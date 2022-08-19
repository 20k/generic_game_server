function make_asteroid(type)
{
	var obj = {};
	obj.name = "Asteroid";
	obj.type = "asteroid";
	obj.asteroid_type = type;
	
	return obj;
}

function make_ship(ship_name)
{
	var obj = {};
	obj.name = "Ship";
	obj.type = "ship";
	obj.friendly_name = ship_name;
	
	return obj;
}

function make_station(station_name)
{
	var obj = {};
	obj.name = "Station";
	obj.type = "station";
	obj.friendly_name = station_name;
	
	return obj;
}

function format_entity(e)
{
	if(e.type == "ship")
	{
		return e.name + " (\"" + e.friendly_name + "\")";
	}
	else if(e.type == "asteroid")
	{
		return e.name + " (" + e.asteroid_type + ")";
	}
	else if(e.type == "station")
	{
		return e.name + " (\"" + e.friendly_name + "\")";
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
	make_ship("Stinky Names"),
	make_ship("Also A Ship"),
	make_asteroid("Ironing"),
	make_asteroid("Flytanium"),
	make_station("Owo station"),
	make_station("Stationary")
];

/*var result = "";

for(var v of objs)
{
	result += format_entity(v) + "\n";
}

result*/

var types = [];

var secondary = [];

for(var e of objs)
{
	types.push(e.name);
	
	if(e.type == "ship")
	{
		secondary.push(" (\"" + e.friendly_name + "\")");
	}
	else if(e.type == "asteroid")
	{
		secondary.push(" (" + e.asteroid_type + ")");
	}
	else if(e.type == "station")
	{
		secondary.push(" (\"" + e.friendly_name + "\")");
	}
}

var fmt_1 = format(types);
var fmt_2 = format(secondary);

var merged = array_concat(fmt_1, fmt_2);

merged.join('\n');