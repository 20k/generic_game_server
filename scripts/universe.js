function make_universe()
{
	return {
		contents:[],
		
		take(sys) {
			this.contents.push(sys);
		},
		
		tick(delta_time_s) {
			for(var sys of this.contents)
			{
				sys.tick(this, 1.);
			}
		}
	};
}
