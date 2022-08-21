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
		gid:0,
		
		take(obj) {
			obj.uid = this.gid++;

			this.contents.push(obj);

			return obj;
		},
		
		tick(universe, sys, elapsed_time_s) {
			for(var en of this.contents)
			{
				var poi = this;
				
				function curried_action_executor(act, real_delta_time)
				{
					execute_action(universe, sys, poi, en, act, real_delta_time);
				}
				
				en.add_action_time(elapsed_time_s, curried_action_executor);
			}
		},
		
		distance(e1, e2) {
			var dx = e2.position[0] - e1.position[0];
			var dy = e2.position[1] - e1.position[1];
			
			return Math.sqrt(dx * dx + dy * dy);
		},
		
		time_to_target(source, target) {
			var my_speed = source.get_speed();
			
			var dist = this.distance(source, target);
			
			if(my_speed > 0.0001)
				return dist / my_speed;
			
			return 0;
		}
	};
	
	return obj;
}