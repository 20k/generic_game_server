function make_universe()
{
	return {
		contents:[],
		gid:0,
		
		take(sys) {
			sys.uid = this.gid++;
			
			this.contents.push(sys);
			
			return sys;
		},
		
		tick(delta_time_s) {
			for(var sys of this.contents)
			{
				sys.tick(this, 1.);
			}
		}
	};
}
