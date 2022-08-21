function make_move_subobject(e, finish_position)
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
		finish_elapsed: 0,
		
		remaining_time() {
			return this.elapsed_time_s - this.current_elapsed;
		},
		
		finished() {
			return this.current_elapsed >= this.elapsed_time_s - 0.000001;
		}
	};
	
	return obj;
}

function make_move_action(e, finish_position, elapsed_time_s)
{
	var obj = make_action();
	
	obj.subtype = "move";
	obj.subobject = make_move_subobject(e, finish_position, elapsed_time_s);
	obj.finish_elapsed = elapsed_time_s;

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
		
		while(this.actions.length > 0 && remaining > 0)
		{		
			var consumable = Math.min(this.actions[0].remaining_time(), remaining);
			
			action_executor(this.actions[0], consumable);
			
			this.actions[0].current_elapsed += consumable;
			
			remaining -= consumable;
			
			if(this.actions[0].finished())
			{
				this.actions.shift();
			}
		}
	}
}


function execute_action(world, sys, poi, en, act, real_time_s)
{
	
}