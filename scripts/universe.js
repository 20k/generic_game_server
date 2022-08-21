exec("get_unique_id")
exec("api");

export function make_universe()
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
		},
		
		/*store() {
			var uid_contents = [];
			
			for(var i=0; i < contents.length; i++)
			{
				uid_contents.push(contents[i].uid);
			}
			
			store_key_value(this.uid, {uid_contents:uid_contents}); 
		},
		
		
		
		load(in_uid) {
			this.uid = in_uid;
			
			var obj = get_by_key(this.uid);
			
			contents.length = 0;
			
			for(var i=0; i < obj.uid_contents; i++)
			{
				var to_load = 
			}
		}*/
	};
}
