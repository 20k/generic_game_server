//mexec("universe");
//import {default as _} from "universe.js"
import {Universe} from "universe"
import {generate_universe} from "generate_universe"
import {render_universe_contents} from "get_system_contents"
import {make_player} from "player"
import {get_debug} from "debug"
import {store_object, load_object} from "api"

{
	var rstx = db.read_write();

	var should_reset = rstx.read(0, "reset");
	rstx.write(0, "reset", 0);
	rstx.close();

	if(should_reset === 1)
	{
		globalThis.player = undefined;
	}

	if(imgui.button("Reset Player View"))
	{
		globalThis.player = undefined;
	}
}

if(imgui.button("Reset Universe"))
{
	globalThis.universe = generate_universe(globalThis.player);
}

if(globalThis.test == undefined)
	globalThis.test = false;

if(globalThis.player == undefined)
{
	globalThis.player = make_player();
}

/*if(globalThis.universe == undefined)
{
	globalThis.universe = generate_universe(globalThis.player);
}*/

if(imgui.button("Hello there"))
{
	globalThis.test = !globalThis.test;
}

imgui.text(exec("hello") + " " + globalThis.test);

if(globalThis.universe != undefined)
	render_universe_contents(globalThis.universe, globalThis.player);

var t2 = db.read_only();

var value = t2.read(0, "hello");

t2.close();

imgui.text("DB val " + value);

if(imgui.button("Tick"))
{
	globalThis.universe.tick(1.)
}

//if(globalThis.last_debug != undefined)

//if(get_debug() != undefined)
{
	imgui.text("Dbg: " + get_debug());
}

if(imgui.button("TestSaveLoad"))
{
	var universe_flattened = globalThis.universe.store();

	globalThis.universe = new Universe();

	globalThis.universe.load(universe_flattened);
}

if(imgui.button("Save"))
{
	//var universe_flattened = globalThis.universe.store();
	var uid = store_object(globalThis.universe);

	var t = db.read_write();
	t.write(3, 0, uid);
	t.close();
}

if(imgui.button("Load"))
{
	var t = db.read_only();
	var uni_uid = t.read(3, 0);
	t.close();

	globalThis.universe = load_object(uni_uid);
}

if(imgui.button("Undef Universe")) {
	globalThis.universe = undefined;
}

imgui.text("My Id " + get_client_id());