function make_universe()
{
	return {
		contents:[],
		take(sys) {
			this.contents.push(sys);
		}
	};
}
