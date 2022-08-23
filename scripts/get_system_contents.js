import {PendingAction} from "action"
import {clear_actions_for, add_pending_action, transfer_item} from "user_facing_api"
import { warp_to_poi } from "./user_facing_api";

if(globalThis.has_drag_drop == undefined) {
	globalThis.has_drag_drop = false;
	globalThis.drag_drop_contents = {};
	globalThis.drag_amount = imgui.ref(0);
}

function format_position(position)
{
	return "[" + position[0] + ", " + position[1] + "]";
}

function get_asteroid_description(asteroid)
{
	var largest_ore_amount = 0;
	var largest_ore_index = 0;

	if(asteroid.cargo.stored.length == 0)
		return "Barren";

	for(var i=0; i < asteroid.cargo.stored.length; i++)
	{
		if(asteroid.cargo.stored[i].volume >= largest_ore_amount)
		{
			largest_ore_amount = asteroid.cargo.stored[i].volume;
			largest_ore_index = i;
		}
	}

	var largest_ore = asteroid.cargo.stored[largest_ore_index];

	return largest_ore.ore_name + " (" + largest_ore.volume + ")";
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

var render_id = 0;

function interactive_poi_contents(sys, poi, player)
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

	var controlled = null;

	for(var e of poi.contents)
	{
		if(player.controlling == e.uid)
		{
			controlled = e;
			break;
		}
	}

	for(var i=0; i < poi.contents.length; i++)
	{
		var e = poi.contents[i];

		var formatted_type = fmt_1[i];
		var formatted_name = fmt_2[i];
		var formatted_position = fmt_3[i];

		if(e.type == "ship" || e.type == "station") {
			if(e.cargo.stored.length != 0) {
				imgui.unindent();

				var id_open = player.view.is_uid_open(e.uid);

				var str = "+";

				if(id_open) {
					str = "-";
				}

				str += "###" + render_id++;

				if(imgui.smallbutton(str)) {
					id_open = !id_open;
					player.view.set_uid_open(e.uid, id_open);
				}

				imgui.sameline();
				imgui.indent();
			}
		}

		imgui.text(formatted_type + " | " + formatted_name + " | " + formatted_position);

		if((e.type == "ship" || e.type == "station") && e.owner == player.uid) {
			imgui.begindragdroptarget();

			var res = imgui.acceptdragdroppayload("none");

            if(res != null) {
				var source_uid = res.source;
				var cargo_uid = res.cargo;
				var target_uid = e.uid;
				//transfer_item(source_uid, target_uid, cargo_uid, amount);

				globalThis.has_drag_drop = true;
				globalThis.drag_drop_contents = {source_uid, cargo_uid, target_uid, max_cargo:res.max_cargo};
			}

       		 imgui.enddragdroptarget();
		}

		if(e.type == "ship" && e.owner == player.uid && player.controlling != e.uid)
		{
			/*imgui.sameline();

			imgui.text("hi" + e.uid);*/

			imgui.sameline();

			if(imgui.smallbutton("[control]##" + render_id++))
			{
				player.take_control(e);
			}
		}

		if(controlled != null)
		{
			if(e.uid != controlled.uid)
			{
				imgui.sameline();

				///will need to validate actions
				if(imgui.smallbutton("[move]##" + render_id++))
				{
					//var time_to_target = poi.time_to_target(controlled, e);

					var pending = new PendingAction();
					pending.build_move(player.controlling, e.position);

					clear_actions_for(player.controlling);
					add_pending_action(pending);
				}

				if(e.type == "asteroid")
				{
					if(poi.distance(controlled, e) < 1)
					{
						imgui.sameline();

						if(imgui.smallbutton("[mine]##" + render_id++))
						{
							var pending = new PendingAction();
							pending.build_mine(player.controlling, e.uid);

							clear_actions_for(player.controlling);
							add_pending_action(pending);
						}
					}
				}
			}
		}

		if((e.type == "ship" || e.type == "station") && player.view.is_uid_open(e.uid)) {
			imgui.indent();

			for(var cargo of e.cargo.stored) {

				if(e.owner == player.uid) {
					imgui.selectable(cargo.format());

					imgui.begindragdropsource();

						imgui.setdragdroppayload("none", {source:e.uid, cargo:cargo.uid, max_cargo:cargo.volume});

					imgui.enddragdropsource();
				}
				else {
					imgui.text(cargo.format());
				}
			}

			imgui.unindent();
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

function interactive_sys_contents(sys, player_view, player)
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

		if(player.controlling != -1) {
			imgui.sameline();

			if(imgui.smallbutton("[warp]##" + render_id++)) {
				clear_actions_for(player.controlling);
				warp_to_poi(player.controlling, poi.uid);
				print("target " + poi.uid);
			}
		}

		if(is_open)
		{
			imgui.indent();
			imgui.indent();
			interactive_poi_contents(sys, poi, player);
			imgui.unindent();
			imgui.unindent();
		}
	}

	imgui.unindent();

	imgui.popstylecolor(3);
}

export function render_universe_contents(universe, player)
{
	render_id = 0;

	for(var sys of universe.contents)
	{
		interactive_sys_contents(sys, player.view, player);
	}

	if(globalThis.has_drag_drop) {
		///transfer_item(source_uid, target_uid, cargo_uid, amount);
		imgui.sliderfloat("Transfer", globalThis.drag_amount, 0, globalThis.drag_drop_contents.max_cargo);

		imgui.sameline();

		if(imgui.button("Confirm")) {
			var o = globalThis.drag_drop_contents;

			var unrounded = imgui.get(globalThis.drag_amount);

			var amount = Math.ceil(unrounded * 100) / 100;

			transfer_item(o.source_uid, o.target_uid, o.cargo_uid, amount);

			globalThis.has_drag_drop = false;
		}

		imgui.sameline();

		if(imgui.button("Cancel")) {
			globalThis.has_drag_drop = false;
		}
	}
}

//format_sys_contents(sys);