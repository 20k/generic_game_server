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

function make_warp_gate(src_sys, dest_sys)
{
	var obj = make_object_with_position([0, 0]);
	obj.name = "Warp Gate";
	obj.type = "warpgate";
	obj.nickname = dest_sys.system_name;
	obj.dest_uid = dest_sys.uid;
	obj.src_uid = src_sys.uid;
	
	return obj;
}

function connect_systems(sys1, sys2)
{
	var warp_boundary = 100;
	
	var direction = [sys2.position[0] - sys1.position[0], sys2.position[1] - sys1.position[0]]
	
	var length = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1]);
	
	var n_dir = [direction[0] / length, direction[1] / length]
	
	var pos_in_1 = [Math.round(n_dir[0] * warp_boundary), Math.round(n_dir[1] * warp_boundary)];	
	var pos_in_2 = [-pos_in_1[0], -pos_in_1[1]]
	
	var poi_1 = make_poi("Gate to " + sys2.system_name, "warpgate", pos_in_1);
	var poi_2 = make_poi("Gate to " + sys1.system_name, "warpgate", pos_in_2);
	
	var gate_1 = make_warp_gate(sys1, sys2);
	var gate_2 = make_warp_gate(sys2, sys1);
	
	add_to_poi(poi_1, gate_1);
	add_to_poi(poi_2, gate_2);
	
	add_poi_to_system(sys1, poi_1);
	add_poi_to_system(sys2, poi_2);
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
		else if(e.type == "warpgate")
		{
			names.push(e.nickname);
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

	return merged.join('\n');
}

function format_poi_name(poi)
{
	return poi.poi_name + " " + format_position(poi.position)
}

function make_system(system_name, position, uid)
{
	var obj = make_object_with_position(position);
	obj.name = "System";
	obj.type = "system";
	obj.system_name = system_name;
	obj.contents = [];
	obj.gid = 0;
	obj.uid = uid;
	
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

var render_id = 0;

function interactive_sys_contents(sys, player_view)
{
	///hacky
	//var render_id = sys.uid * 129;
	
	imgui.pushstylecolor(21, 0, 0, 0, 0); 
	imgui.pushstylecolor(22, 0, 0, 0, 0); 
	imgui.pushstylecolor(23, 0, 0, 0, 0); 

	if(player_view.is_sys_open[sys.uid] == undefined)
		player_view.is_sys_open[sys.uid] = 1;
	
	var is_sys_open = player_view.is_sys_open[sys.uid];
	
	var sys_str = "+";
	
	if(is_sys_open)
		sys_str = "-";
	
	sys_str += "###" + render_id++;
	
	if(imgui.button(sys_str))
	{
		is_sys_open = !is_sys_open;
		player_view.is_sys_open[sys.uid] = is_sys_open;
	}
	
	imgui.sameline();
	
	imgui.text("System : " + sys.system_name + " " + format_position(sys.position) + "\n");
	
	if(!is_sys_open)
		return;
	
	imgui.indent();
	
	for(var poi of sys.contents)
	{
		var title = format_poi_name(poi);
					
		var is_open = view_is_poi_open(player_view, sys, poi);
			
		var str = "+";
		
		if(is_open)
			str = "-";
		
		str += "###" + render_id++;			
				
		if(imgui.button(str))
		{
			is_open = !is_open;
			view_set_is_poi_open(player_view, sys, poi, is_open);
		}
		
		imgui.sameline();
				
		imgui.text(title);
		
		if(is_open)
		{			
			imgui.indent();
			imgui.indent();
			imgui.text(format_poi_contents(poi));
			imgui.unindent();
			imgui.unindent();
		}
	}
	
	imgui.unindent();
	
	imgui.popstylecolor(3);
}


var poi = make_poi("Asteroid Belt", "asteroidbelt", [20, 30]);

add_to_poi(poi, make_ship([50, 40], "Stinky Names"));
add_to_poi(poi, make_ship([100, 20], "Also A Ship"));
add_to_poi(poi, make_asteroid([150, 10]));
add_to_poi(poi, make_asteroid([300, 10]));
add_to_poi(poi, make_station([5, 223], "Owo station"));
add_to_poi(poi, make_station([10, 9], "Stationary"));

var sys1 = make_system("Alpha Blenturi", [10, 10], 0);
var sys2 = make_system("Barnard's Spire", [15, 13], 1);

connect_systems(sys1, sys2);

add_poi_to_system(sys1, poi);

interactive_sys_contents(sys1, view);
interactive_sys_contents(sys2, view);

//format_sys_contents(sys);