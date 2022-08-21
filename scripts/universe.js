exec("get_unique_id")
exec("api");

export class Universe
{
	constructor()
	{
		this.contents = [];
		this.uid = get_unique_id();
	}
	
	take(sys) {
		this.contents.push(sys);
		
		return sys;
	}
	
	tick(delta_time_s) {
		for(var sys of this.contents)
		{
			sys.tick(this, delta_time_s);
		}
	}
}

export function make_universe()
{
	return new Universe();
}
