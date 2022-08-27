// @ts-check

import {make_poi} from "./poi";
import {make_warp_gate} from "./object"
import {store_object, load_object, save_uids, load_uids} from "./api"
import {set_debug} from "./debug"
import {ActionMan, execute_action, finalise_action} from "./action"
import {get_unique_id} from "./get_unique_id"

export function round_warp_position(position) {
	return [Math.round(position[0]), Math.round(position[1])];
}

export class System
{
	constructor()
	{
		this.position = [0, 0]
		this.name = "System";
		this.type = "system";
		this.system_name = "Err;"
		this.contents = [];
		this.uid = get_unique_id();
		this.action_man = new ActionMan();
	}

	take_poi(poi) {
		this.contents.push(poi);

		return poi;
	}

	handle_actions(universe, elapsed_time_s) {
		var me = this;

		function curried_action_executor(act, real_delta_time)
		{
			var lookup = me.lookup_slow_opt(act.source_uid);

			if(lookup == null)
				return;

			execute_action(universe, me, lookup.poi, lookup.en, act, real_delta_time);
		}

		function curried_action_finaliser(act)
		{
			var lookup = me.lookup_slow_opt(act.source_uid);

			if(lookup == null)
				return;

			finalise_action(universe, me, lookup.poi, lookup.en, act);
		}

		this.action_man.add_action_time(elapsed_time_s, curried_action_executor, curried_action_finaliser);
	}

	add_action(act) {
		this.action_man.add_action(act);
	}

	transfer_entity_to_poi(source_poi, en, target_poi) {
		if(source_poi == target_poi)
			return;

		var removed_en = source_poi.extract_entity(en.uid);

		if(removed_en == null)
			return;

		var relative_dir = norm(target_poi.position, source_poi.position);
		var arrival_radius = 200;

		relative_dir[0] *= arrival_radius;
		relative_dir[1] *= arrival_radius;

		removed_en.position = round_warp_position(relative_dir);

		target_poi.add_entity(removed_en);
	}

	tick(universe, elapsed_time_s) {
		for(var poi of this.contents) {
			poi.tick(universe, this, elapsed_time_s);
		}

		this.handle_actions(universe, elapsed_time_s);
	}

	///temporary
	lookup_slow_opt(id) {
		for(var poi of this.contents)
		{
			for(var e of poi.contents)
			{
				if(e.uid == id)
					return {poi, en:e};
			}
		}

		return null;
	}

	lookup_poi_slow_opt(id) {
		for(var poi of this.contents) {
			if(poi.uid == id)
				return poi;
		}

		return null;
	}

	store()
	{
		var contents_uid = save_uids(this.contents);
		var action_uid = store_object(this.action_man);

		return {position:this.position, name:this.name, system_name:this.system_name, contents_uid:contents_uid, action_uid:action_uid}
	}

	load(obj)
	{
		this.position = obj.position;
		this.name = obj.name;
		this.type = obj.type;
		this.system_name = obj.system_name
		this.contents = load_uids(obj.contents_uid);
		this.action_man = load_object(obj.action_uid);
		this.uid = obj.uid;
	}
}

export function make_system(system_name, position)
{
	var obj = new System();
	obj.position = position;
	obj.system_name = system_name;

	return obj;
}

export function norm(p1, p2) {
	var dx = p2[0] - p1[0];
	var dy = p2[1] - p1[1];

	var length = Math.sqrt(dx * dx + dy * dy);

	return [dx / length, dy / length];
}

export function connect_systems(sys1, sys2)
{
	var warp_boundary = 100;

	var n_dir = norm(sys1.position, sys2.position);

	var pos_in_1 = [Math.round(n_dir[0] * warp_boundary), Math.round(n_dir[1] * warp_boundary)];
	var pos_in_2 = [-pos_in_1[0], -pos_in_1[1]]

	var poi_1 = make_poi("Gate to " + sys2.system_name, "warpgate", pos_in_1);
	var poi_2 = make_poi("Gate to " + sys1.system_name, "warpgate", pos_in_2);

	var gate_1 = make_warp_gate(sys1, poi_1, sys2, poi_2);
	var gate_2 = make_warp_gate(sys2, poi_2, sys1, poi_1);

	poi_1.take(gate_1);
	poi_2.take(gate_2);

	sys1.take_poi(poi_1);
	sys2.take_poi(poi_2);
}
