function make_object_with_position(position)
{
	var obj = {};
	obj.position = position;
	
	return obj;
}

function format_position(position)
{
	return "[" + position[0] + ", " + position[1] + "]";
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
	
	return largest_ore.ore_name + " (" + largest_ore.ore_amount + ")";
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

function make_poi(poi_name, poi_type, position)
{
	var obj = make_object_with_position(position);
	obj.name = "PoI";
	obj.type = "poi";
	obj.poi_name = poi_name;
	obj.poi_type = poi_type;
	obj.contents = [];
	
	return obj;
}

function add_to_poi(poi, obj)
{
	poi.contents.push(obj);
}

function format_poi_contents(poi)
{
	var types = [];
	var names = [];
	var positions = [];

	for(var e of poi.contents)
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

	return format_poi_name(poi) + "\n" + merged.join('\n');
}

function format_poi_name(poi)
{
	return "PoI    : " + poi.poi_name + " " + format_position(poi.position)
}

function make_system(system_name, position)
{
	var obj = make_object_with_position(position);
	obj.name = "System";
	obj.type = "system";
	obj.system_name = system_name;
	obj.contents = [];
	obj.gid = 0;
	
	return obj;
}

function add_poi_to_system(sys, poi)
{
	poi.uid = sys.gid++;
	
	sys.contents.push(poi);
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

function make_player_view()
{
	var obj = {};
	
	obj.is_open_ref = {};
	obj.is_open = new Map();
	
	return obj;
}

function player_open(obj, poi)
{
	obj.is_open.set(poi.uid, true);
}

function player_close(obj, poi)
{
	obj.is_open.set(poi.uid, false);
}

function player_set_open(obj, poi, val)
{
	obj.is_open.set(poi.uid, val);
}

function player_is_open(obj, poi)
{
	if(!obj.is_open.has(poi.uid))
		return false;
	
	return obj.is_open.get(poi.uid);
}

function format_sys_contents(sys)
{
	//format_position(sys.position) 	
	var res = "System : " + sys.system_name + " " + format_position(sys.position) + "\n";

	for(var poi of sys.contents)
	{
		var str = format_poi_contents(poi);

		res += str + "\n";
	}

	return res;
}

function interactive_sys_contents(sys, player_view)
{
	imgui.text("System : " + sys.system_name + " " + format_position(sys.position) + "\n");
	
	for(var poi of sys.contents)
	{
		var title = format_poi_name(poi);
		
		imgui.text(title);
		
		imgui.sameline();
		
		//var is_selected = player_is_open(player_view, poi);
		
		//var selected_ref = imgui.ref(is_selected);
		
		//if(imgui.arrowbutton("<--"))
					
		if(player_view.is_open_ref[poi.uid] == undefined)
		{
			var ref = imgui.ref(0);
			player_view.is_open_ref[poi.uid] = ref;
		}
		
		var is_open_ref = player_view.is_open_ref[poi.uid];
			
		if(imgui.selectable("Open?", is_open_ref))
		{
			player_set_open(player_view, poi);
			
			imgui.text(format_poi_contents(poi));
		}
		
		//player_set_open(player_view, poi, imgui.get(selected_ref));
	}
}

var view = make_player_view();

var poi = make_poi("Asteroid Belt", "asteroidbelt", [20, 30]);

add_to_poi(poi, make_ship([50, 40], "Stinky Names"));
add_to_poi(poi, make_ship([100, 20], "Also A Ship"));
add_to_poi(poi, make_asteroid([150, 10]));
add_to_poi(poi, make_asteroid([300, 10]));
add_to_poi(poi, make_station([5, 223], "Owo station"));
add_to_poi(poi, make_station([10, 9], "Stationary"));

var sys = make_system("Alpha Blenturi", [10, 10]);

add_poi_to_system(sys, poi);

interactive_sys_contents(sys, view);

//format_sys_contents(sys);