exec("get_unique_id");
import {save_uids, load_uids} from "api"
import {set_debug} from "debug"

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
		this.uid = get_unique_id();
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

	import_from_pending(sys, poi, en, pending) {
		if(pending.pending_action_type == "move") {
			
		}

		if(pending.pending_action_type == "mine") {

		}
	}
	
	load(obj) {
		Object.assign(this, obj);
	}
	
	store() {
		return this;
	}
}

export class PendingAction {
	constructor()
	{
		///temporary, needs to be a trivial serialise later
		this.uid = get_unique_id();
		this.type = "pendingaction";
		this.pending_action_type = "none";
		this.source_uid = -1;
	}

	build_move(e_uid, position) {
		this.pending_action_type = "move";
		this.source_uid = e_uid;
		this.position = position;
	}

	build_mine(source_uid, target_uid) {
		this.pending_action_type = "mine";
		this.source_uid = src_uid;
		this.target_uid = target_uid;
	}
}

export class ActionMan
{
	constructor()
	{
		this.type = "actionman";
		this.actions = [];
		this.uid = get_unique_id();
	}

	import(universe, my_sys) {
		var t = db.read_write();
		var all_reads = t.read_all(2);

		for(var i=0; i < all_reads.length; i++)
		{
			var lookup = universe.lookup_slow_opt(pending.source_uid);

			if(lookup == null)
			{
				t.delete(all_reads[i].k);
				continue;			
			}

			if(lookup.sys != my_sys)
				continue;

			t.delete(all_reads[i].k);
		}

		for(var i=0; i < all_reads.length; i++)
		{
			var pending = all_reads[i].v;

			var lookup = my_sys.lookup_slow_opt(pending.source_uid);

			var act = new Action();
			act.import_from_pending(my_sys, lookup.poi, lookup.en, pending);

			this.add_action(act);
		}
		
		t.close();
	}
	
	add_action(a) {
		this.actions.push(a);
	}
	
	clear_actions() {
		this.actions.length = 0;
	}
	
	clear_actions_for(e_uid) {
		for(var i=0; i < this.actions.length; i++) {
			if(this.actions[i].source_uid == e_uid) {
				this.actions.splice(i, 1);
				i--;
			}
		}
	}
	
	add_action_time(delta_time_s, action_executor) {
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
	
	load(obj) {
		this.actions = load_uids(obj.a_uids);
		this.uid = obj.uid;
	}
	
	store() {
		var actions_uid = save_uids(this.actions);
		
		return {uid:this.uid, type:this.type, a_uids:actions_uid};
	}
}

function make_action()
{
	return new Action();
}

export function make_move_action(e, finish_position, elapsed_time_s)
{
	var obj = make_action();
	
	obj.source_uid = e.uid,	
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
	
	obj.source_uid = e.uid;
	obj.subtype = "mine";
	obj.subobject = {target_uid:target.uid}; //crap, need the asteroid object
	obj.finish_elapsed = time_to_mine;
	
	return obj;
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