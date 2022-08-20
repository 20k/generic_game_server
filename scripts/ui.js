{
	var rstx = db.read_write();
	
	var should_reset = rstx.read(0, "reset");
	rstx.write(0, "reset", 0);
	rstx.close();
	
	if(should_reset === 1)
	{
		globalThis.player = undefined;
	}
}

if(globalThis.test == undefined)
	globalThis.test = false;

if(globalThis.player == undefined)
{
	exec("player");
	
	globalThis.player = make_player(0);
}


if(imgui.button("Hello there"))
{
	globalThis.test = !globalThis.test;
}

imgui.text(exec("hello") + " " + globalThis.test);

//imgui.text(exec("get_system_contents"));

exec("get_system_contents");

var t2 = db.read_only();

var value = t2.read(0, "hello");

t2.close();

imgui.text("DB val " + value);