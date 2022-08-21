function make_move(e, finish_position, elased_time_s)
{
	return {
		object_uid: e.uid,
		start: e.position,
		finish: finish_position
	};
}

function make_action()
{
	var obj = {
		type: "action",
		subtype: "",
		subobject: {},
		
		current_elapsed: 0,
		finish_elapsed: elapsed_time_s,
		
		remaining_time() {
			return this.elapsed_time_s - this.current_elapsed;
		},
		
		finished() {
			return this.current_elapsed >= this.elapsed_time_s - 0.000001;
		}
		
		/*move_entity(e, finish_position, elased_time_s) {
			this.subtype = "move";
			subobject = make_move(e, finish_position, elased_time_s);
		}*/
	};
	
	return obj;
}

function make_entity_actionable(obj)
{	
	obj.actions = [];
	
	obj.add_action = function(a) {
		this.actions.push(a);
	}
	
	obj.add_action_time = function(delta_time_s, action_executor) {
		var remaining = delta_time_s;
		
		while(actions.length > 0 && remaining > 0)
		{		
			var consumable = Math.min(actions[0].remaining_time(), remaining);
			
			action_executor(actions[0], consumable);
			
			actions[0].current_elapsed += consumable;
			
			remaining -= consumable;
			
			if(actions[0].finished())
			{
				actions.shift();
			}
		}
	}
}
