if(globalThis.test == undefined)
	globalThis.test = false;

if(imgui.button("Hello there"))
{
	globalThis.test = !globalThis.test;
}

if(globalThis.test)
{
	imgui.text("Stinky");	
}

imgui.text(exec("hello") + globalThis.test);