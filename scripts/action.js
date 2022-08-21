function make_move(e, finish_position, elased_time_s)
{
	return {
		object_uid: e.uid,
		start: e.position,
		finish: finish_position,
		current_elapsed: 0,
		finish_elapsed: elapsed_time_s
	};
}

function make_action()
{
	var obj = {
		type: "action",
		subtype: "",
		subobject: {},
		
		move_entity(e, finish_position, elased_time_s) {
			this.subtype = "move";
			subobject = make_move(e, finish_position, elased_time_s);
		}
	};
	
	return obj;
}

function make_entity_actionable(obj)
{	
	obj.actions = [];
	
	obj.add_action = function(a) {
		this.actions.push(a);
	}
	
	obj.add_action_time = function(delta_time_s) {
		
	}
}
