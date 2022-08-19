if(globalThis.test == undefined)
	globalThis.test = false;

if(imgui.button("Hello there") || globalThis.test)
{
	globalThis.test = true;
	
	imgui.text("Clicked");
}

imgui.text("hello " + globalThis.test);