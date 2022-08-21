exec("action");

function make_poi(poi_name, poi_type, position)
{
	var obj = {
		position:position,
		name:"PoI",
		type:"poi",
		poi_name:poi_name,
		poi_type:poi_type,
		contents:[],
		
		take(obj) {
			this.contents.push(obj);			
		},
		
		tick(world, sys, elapsed_time_s) {
			for(var en of this.contents)
			{
				var poi = this;
				
				function curried_action_executor(act, real_delta_time)
				{
					execute_action(world, sys, poi, en, act, real_delta_time);
				}
				
				en.add_action_time(elapsed_time_s, curried_action_executor);
			}
		}
	};
	
	return obj;
}