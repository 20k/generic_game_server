// @ts-check

import {get_unique_id} from "./get_unique_id"
import {save_uids, load_uids} from "./api"
import {round_volume} from "./item"
import {set_debug} from "./debug"
import {activate_warp_gate} from "./universe"

function make_move_subobject(e, finish_position) {
	return {
		//object_uid: e.uid,
		start: e.position,
		finish: finish_position
	};
}

export function distance(e1_position, e2_position) {
	var dx = e2_position[0] - e1_position[0];
	var dy = e2_position[1] - e1_position[1];

	return Math.sqrt(dx * dx + dy * dy);
}

function time_to_target(source, target_position) {
	var my_speed = source.get_speed();

	var dist = distance(source.position, target_position);

	if(my_speed > 0.0001)
		return dist / my_speed;

	return 0;
}

function make_action()
{
	return new Action();
}

function safe_time_to_target(source_pos, destination_pos, my_speed) {
	var dist = distance(source_pos, destination_pos);

	if(my_speed > 0.0001)
		return dist / my_speed;

	return 0;
}

function make_move_action(e, finish_position) {
	var elapsed_time_s = time_to_target(e, finish_position);
	var subobject = make_move_subobject(e, finish_position);

	var obj = make_action();
	obj.build_generic(e.uid, "move", subobject, elapsed_time_s);

	return obj;
}

function make_interrupt_action(e_uid) {
	var obj = make_action();
	obj.build_generic(e_uid, "interrupt", {}, 0);

	return obj;
}

function make_mine_action(e, target)
{
	var to_mine = target.get_total_ore();

	to_mine = Math.min(to_mine, e.get_free_storage());

	var time_to_mine = 0;

	var mine_power = e.get_mining_power();

	if(mine_power > 0.0001)
	{
		time_to_mine = to_mine / mine_power;
	}

	var obj = make_action();
	obj.build_generic(e.uid, "mine", {target_uid:target.uid}, time_to_mine);

	return obj;
}

function make_transfer_item_action(source_uid, destination_uid, cargo_uid, volume) {
	var subobject = {destination_uid, cargo_uid, volume};

	var obj = make_action();
	obj.build_generic(source_uid, "transfer_item", subobject, 0);

	return obj;
}

function make_warp_to_poi_action(source_poi, source_entity, dest_poi) {
	var subobject = {dest_poi_uid: dest_poi.uid};
	var time = safe_time_to_target(source_poi.position, dest_poi.position, source_entity.get_warp_speed());

	var obj = make_action();
	obj.build_generic(source_entity.uid, "warp_to_poi", subobject, time);

	return obj;
}

function make_activate_warp_gate_action(source_entity, warp_gate_uid) {
	var subobject = {warp_gate_uid};
	var time = source_entity.get_warp_time();

	var obj = make_action();
	obj.build_generic(source_entity.uid, "activate_warp_gate", subobject, time);

	return obj;
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
		this.source_uid = source_uid;
		this.target_uid = target_uid;
	}

	build_interrupt(e_uid) {
		this.pending_action_type = "interrupt";
		this.source_uid = e_uid;
	}

	build_transfer_item(source_uid, destination_uid, cargo_uid, volume) {
		this.pending_action_type = "transfer_item";
		this.source_uid = source_uid;
		this.destination_uid = destination_uid;
		this.cargo_uid = cargo_uid;
		this.volume = volume;
	}

	build_warp_to_poi(source_uid, dest_poi_uid) {
		this.pending_action_type = "warp_to_poi";
		this.source_uid = source_uid;
		this.dest_poi_uid = dest_poi_uid;
	}

	build_activate_warp_gate(source_uid, warp_gate_uid) {
		this.pending_action_type = "activate_warp_gate";
		this.source_uid = source_uid;
		this.warp_gate_uid = warp_gate_uid;
	}
}

function pending_action_to_action(sys, poi, en, pending) {
	if(pending.pending_action_type == "move") {
		return make_move_action(en, pending.position);
	}

	if(pending.pending_action_type == "mine") {
		var target = poi.lookup_slow_opt(pending.target_uid);

		if(target == null)
			return null;

		return make_mine_action(en, target);
	}

	if(pending.pending_action_type == "interrupt") {
		return make_interrupt_action(pending.source_uid);
	}

	if(pending.pending_action_type == "transfer_item") {
		return make_transfer_item_action(pending.source_uid, pending.destination_uid, pending.cargo_uid, pending.volume);
	}

	if(pending.pending_action_type == "warp_to_poi") {
		var target_poi = sys.lookup_poi_slow_opt(pending.dest_poi_uid);

		if(target_poi == null)
			return;

		if(en.type != "ship") {
			return;
		}

		return make_warp_to_poi_action(poi, en, target_poi);
	}

	if(pending.pending_action_type == "activate_warp_gate") {
		return make_activate_warp_gate_action(en, pending.warp_gate_uid);
	}

	return null;
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

	build_generic(source_uid, subtype, subobject, finish_elapsed) {
		this.source_uid = source_uid;
		this.subtype = subtype;
		this.subobject = subobject;
		this.finish_elapsed = finish_elapsed;
	}

	remaining_time() {
		return this.finish_elapsed - this.current_elapsed;
	}

	finished() {
		return this.current_elapsed >= this.finish_elapsed - 0.000001;
	}

	should_empty_queue() {
		return this.subtype == "warp_to_poi" && this.finished();
	}

	load(obj) {
		Object.assign(this, obj);
	}

	store() {
		return this;
	}
}

export class ActionMan
{
	constructor()
	{
		this.type = "actionman";
		//this.actions = [];
		this.actions = {};
		this.uid = get_unique_id();
	}

	import(universe, my_sys) {
		// @ts-ignore
		var t = db.read_write();
		var all_reads = t.read_all(2);

		var pending_action_list = [];

		for(var i=0; i < all_reads.length; i++)
		{
			let all_pending = all_reads[i].v;

			for(var pending of all_pending)
			{
				///todo: no lookup on interrupt
				var lookup = universe.lookup_slow_opt(pending.source_uid);

				if(lookup == null)
				{
					t.del(2, all_reads[i].k);
					continue;
				}

				if(lookup.sys != my_sys)
					continue;

				t.del(2, all_reads[i].k);

				pending_action_list.push(pending);
			}
		}

		t.close();

		for(var pending of pending_action_list)
		{
			var lookup = my_sys.lookup_slow_opt(pending.source_uid);

			if(lookup == null)
				continue;

			var act = pending_action_to_action(my_sys, lookup.poi, lookup.en, pending);

			if(act == null)
				continue;

			this.add_action(act);
		}

		for(const k in this.actions) {
			var o = this.actions[k];

			for(var i=0; i < o.length; i++) {
				if(o[i].subtype == "interrupt") {
					o.splice(0, i + 1);
					i = -1;
				}
			}
		}
	}

	add_action(a) {
		var s_uid = a.source_uid;

		if(this.actions[s_uid] == undefined) {
			this.actions[s_uid] = [];
		}

		this.actions[s_uid].push(a);
	}

	add_action_time_to(actions, delta_time_s, action_executor, action_finaliser) {
		var remaining = delta_time_s;

		while(actions.length > 0 && remaining > 0)
		{
			var current_action = actions[0];

			var consumable = Math.min(current_action.remaining_time(), remaining);

			///so, how to handle warping
			action_executor(current_action, consumable);

			current_action.current_elapsed += consumable;
			remaining -= consumable;

			if(current_action.should_empty_queue()) {
				action_finaliser(current_action);
				actions.length = 0;
				return;
			}

			if(current_action.finished()) {
				action_finaliser(current_action);
				actions.shift();
				continue;
			}
		}
	}

	add_action_time(delta_time_s, action_executor, action_finaliser) {
		for(const k in this.actions) {
			var actions = this.actions[k];
			var time_remaining = delta_time_s;

			this.add_action_time_to(actions, time_remaining, action_executor, action_finaliser);
		}
	}

	load(obj) {
		var loaded = {};

		for(const k in obj.a_uids) {
			loaded[k] = load_uids(obj.a_uids[k]);
		}

		this.actions = loaded;
		this.uid = obj.uid;
	}

	store() {
		var actions_uid = {};

		for(const k in this.actions) {
			actions_uid[k] = save_uids(this.actions[k]);
		}

		return {uid:this.uid, type:this.type, a_uids:actions_uid};
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
		if(en.type != "ship" && en.type != "station") {
			return;
		}

		var object = poi.lookup_slow_opt(act.subobject.target_uid);

		if(object == null)
			return;

		var mineable = en.get_mining_power() * real_time_s;

		mineable = Math.min(mineable, en.get_free_storage());

		var returned_items = object.mine(mineable);

		en.cargo.fill_items(returned_items);
	}

	if(act.subtype == "transfer_item") {
		var target_object = poi.lookup_slow_opt(act.subobject.destination_uid);
		var volume = act.subobject.volume;
		var source_cargo_uid = act.subobject.cargo_uid;

		volume = round_volume(volume);

		if(target_object == null)
			return;

		if(target_object.type != "ship" && target_object.type != "station") {
			return;
		}

		volume = Math.min(volume, target_object.get_free_storage());

		///check how much we can store!

		var source_cargo = en.cargo.take_volume_by_id(source_cargo_uid, volume);

		if(source_cargo == null)
			return;

		target_object.cargo.fill_item(source_cargo);
	}
}

export function finalise_action(universe, sys, poi, en, act) {
	if(act.subtype == "warp_to_poi") {
		var target_poi = sys.lookup_poi_slow_opt(act.subobject.dest_poi_uid);

		if(target_poi == null)
		{
			// @ts-ignore
			print("Err! Target poi null");
			return;
		}

		sys.transfer_entity_to_poi(poi, en, target_poi);
	}

	if(act.subtype == "activate_warp_gate") {
		if(en.type != "ship")
			return;

		///todo: load straight from db
		var warp_gate_unnecessarily_slow = poi.lookup_slow_opt(act.subobject.warp_gate_uid);

		if(warp_gate_unnecessarily_slow == null) {
			// @ts-ignore
			print("No warp gate")
			return;
		}

		if(distance(warp_gate_unnecessarily_slow.position, en.position) > 10)
			return;

		activate_warp_gate(universe, en, warp_gate_unnecessarily_slow);
	}
}