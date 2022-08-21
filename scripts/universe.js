exec("get_unique_id")

function make_universe()
{
	return {
		contents:[],
		uid:get_unique_id(),
		
		take(sys) {			
			this.contents.push(sys);
			
			return sys;
		},
		
		tick(delta_time_s) {
			for(var sys of this.contents)
			{
				sys.tick(this, delta_time_s);
			}
		}
	};
}
