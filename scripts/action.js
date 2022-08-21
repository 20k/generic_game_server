function make_move_subobject(e, finish_position)
{
	return {
		//object_uid: e.uid,
		start: e.position,
		finish: finish_position
	};
}

export class Action
{
	constructor()
	{
		this.type = "action";
		this.subtype = "";
		this.subobject = {};
		
		this.current_elapsed = 0;
		this.finish_elapsed = 0;
	}
	
	remaining_time() {
		return this.finish_elapsed - this.current_elapsed;
	}
	
	finished() {
		return this.current_elapsed >= this.finish_elapsed - 0.000001;
	}
}

function make_action()
{
	return new Action();
}

export function make_move_action(e, finish_position, elapsed_time_s)
{
	var obj = make_action();
	
	obj.subtype = "move";
	obj.subobject = make_move_subobject(e, finish_position, elapsed_time_s);
	obj.finish_elapsed = elapsed_time_s;

	return obj;
}

export function make_mine_action(e, target)
{
	var total_ore = target.get_total_ore();
	
	var time_to_mine = 0;
	
	var mine_power = e.get_mining_power();
	
	if(total_ore > 0.0001 && mine_power > 0.0001)
	{
		time_to_mine = total_ore / mine_power;
	}
	
	var obj = make_action();
	
	obj.subtype = "mine";
	obj.subobject = {target_uid:target.uid}; //crap, need the asteroid object
	obj.finish_elapsed = time_to_mine;
	
	return obj;
}

export function make_entity_actionable(obj)
{	
	obj.actions = [];
	
	obj.add_action = function(a) {
		this.actions.push(a);
	}
	
	obj.clear_actions = function() {
		this.actions.length = 0;
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
				//var clen = this.actions.length;
								
				this.actions.shift();
				
				//var dlen = this.actions.length;
				//globalThis.last_debug = clen + "hi" + dlen;
			}
		}
	}
}

export function execute_action(universe, sys, poi, en, act, real_time_s)
{
	if(act.subtype == "move")
	{	
		if(act.finish_elapsed == 0)
			return;

		var move_object = act.subobject;
		
		var start_pos = move_object.start;
		var finish_pos = move_object.finish;
		
		var delta = [finish_pos[0] - start_pos[0], finish_pos[1] - start_pos[1]]
					
		var current_time = act.current_elapsed + real_time_s;
		
		globalThis.last_debug = current_time + "Rtime";
		
		var analytic_pos = [start_pos[0] + delta[0] * current_time / act.finish_elapsed, start_pos[1] + delta[1] * current_time / act.finish_elapsed]
		
		analytic_pos[0] = Math.round(analytic_pos[0] * 100) / 100;
		analytic_pos[1] = Math.round(analytic_pos[1] * 100) / 100;
		
		en.position = analytic_pos;		
	}
	
	if(act.subtype == "mine")
	{
		//globalThis.last_debug = "mine"
		
		var object = poi.lookup_slow_opt(act.subobject.target_uid);
		
		if(object == null)
			return;
		
		var returned_items = object.mine(en.get_mining_power() * real_time_s);
		
		if(returned_items.length == 0)
			return;
		
		//globalThis.last_debug = "Mined " + returned_items[0].ore_amount;
	}
}