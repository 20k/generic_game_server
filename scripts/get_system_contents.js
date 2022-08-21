exec("system");
exec("poi");
exec("object");
exec("universe");

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

function interactive_poi_contents(poi)
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
		else
		{
			names.push("No Name");
		}

		positions.push("[" + e.position[0] + ", " + e.position[1] + "]");
	}

	//types.unshift("Name");
	//names.unshift("Nickname");
	//positions.unshift("Position");

	var fmt_1 = format(types);
	var fmt_2 = format(names);
	var fmt_3 = format(positions);

	/*var merged = array_concat(array_concat(fmt_1, fmt_2, ' | '), fmt_3, ' | ');

	imgui.text(merged.join("\n"))*/

	for(var i=0; i < poi.contents.length; i++)
	{
		var e = poi.contents[i];

		var formatted_type = fmt_1[i];
		var formatted_name = fmt_2[i];
		var formatted_position = fmt_3[i];

		imgui.text(formatted_type + " | " + formatted_name + " | " + formatted_position);

		if(e.type == "ship" && e.owner == player.uid && player.controlling != e.uid)
		{
			/*imgui.sameline();

			imgui.text("hi" + e.uid);*/

			imgui.sameline();

			if(imgui.smallbutton("Control "))
			{
				player.take_control(e);
			}
		}
	}
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
	var res = "System: " + sys.system_name + " " + format_position(sys.position) + "\n";

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

	var is_sys_open = player_view.is_sys_open(sys);

	var sys_str = "+";

	if(is_sys_open)
		sys_str = "-";

	sys_str += "###" + render_id++;

	if(imgui.button(sys_str))
	{
		is_sys_open = !is_sys_open;
		player_view.set_is_sys_open(sys, is_sys_open);
	}

	imgui.sameline();

	imgui.text("System: " + sys.system_name + " " + format_position(sys.position) + "\n");

	if(!is_sys_open)
	{
		imgui.popstylecolor(3);
		return;
	}

	imgui.indent();

	for(var poi of sys.contents)
	{
		var title = format_poi_name(poi);

		var is_open = player_view.is_poi_open(sys, poi);

		var str = "+";

		if(is_open)
			str = "-";

		str += "###" + render_id++;

		if(imgui.button(str))
		{
			is_open = !is_open;
			player_view.set_is_poi_open(sys, poi, is_open);
		}

		imgui.sameline();

		imgui.text(title);

		if(is_open)
		{
			imgui.indent();
			imgui.indent();
			interactive_poi_contents(poi);
			imgui.unindent();
			imgui.unindent();
		}
	}

	imgui.unindent();

	imgui.popstylecolor(3);
}

function render_universe_contents(universe)
{
	for(var sys of universe.contents)
	{
		interactive_sys_contents(sys, player.view);
	}
}

render_universe_contents(universe);

//format_sys_contents(sys);