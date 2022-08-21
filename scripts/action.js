function make_move_subobject(e, finish_position)
{
	return {
		//object_uid: e.uid,
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
	if(act.subtype == "move")
	{
		var move_object = act.subobject;
		
		var start_pos = move_object.start;
		var finish_pos = move_object.finish;
		
		var delta = [finish_pos[0] - start_pos[0], finish_pos[1] - start_pos[1]]
		
		//var real_delta = [real_time_s * delta[0]/act.finish_elapsed_s, real_time_s * delta[1]/act.finish_elapsed_s]
		
		var current_time = act.current_elapsed + real_time_s;
		
		var analytic_pos = [delta[0] * current_time / act.finish_elapsed_s, delta[1] * current_time / act.finish_elapsed_s]
		
		en.position = analytic_pos;		
	}
}