exec("system");
exec("poi");
exec("object");

function format_position(position)
{
	return "[" + position[0] + ", " + position[1] + "]";
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