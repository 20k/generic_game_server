// @ts-check

import {get_unique_id} from "get_unique_id"
import {load_object, save_uids, load_uids} from "api"
import {norm, round_warp_position} from "system";

export class Universe
{
	constructor()
	{
		this.contents = [];
		this.uid = get_unique_id();
		this.type = "universe";
	}

	take(sys) {
		this.contents.push(sys);

		return sys;
	}

	tick(delta_time_s) {
		this.import_all();

		for(var sys of this.contents)
		{
			sys.tick(this, delta_time_s);
		}
	}

	store()
	{
		var contents_uid = save_uids(this.contents);

		return {contents_uid}
	}

	load(obj)
	{
		this.uid = obj.uid;
		this.contents = load_uids(obj.contents_uid)
	}

	lookup_sys_slow_opt(sys_id) {
		for(var e of this.contents) {
			if(e.uid == sys_id)
				return e;
		}

		return null;
	}

	lookup_slow_opt(id) {
		for(var sys of this.contents)
		{
			for(var poi of sys.contents)
			{
				for(var e of poi.contents)
				{
					if(e.uid == id)
						return {sys, poi, en:e};
				}
			}
		}

		return null;
	}

	import_all() {
		for(var sys of this.contents) {
			sys.action_man.import(this, sys);
		}
	}
}

export function activate_warp_gate(universe, en, warp_gate) {
	var sys_1 = universe.lookup_sys_slow_opt(warp_gate.src_sys_uid);
	var sys_2 = universe.lookup_sys_slow_opt(warp_gate.dst_sys_uid);

	if(sys_1 == null) {
		print("Null sys1 " + warp_gate.src_sys_uid);
		return;
	}

	if(sys_2 == null) {
		print("Null sys2 " + warp_gate.dst_sys_uid);
		return;
	}

	///impossible
	if(sys_1.uid == sys_2.uid)
		return;

	var poi_1 = sys_1.lookup_poi_slow_opt(warp_gate.src_poi_uid);

	///impossible
	if(poi_1 == null)
		return;

	var poi_2 = sys_2.lookup_poi_slow_opt(warp_gate.dst_poi_uid);

	///impossible
	if(poi_2 == null)
		return;

	var relative_dir = norm(sys_2.position, sys_1.position);
	var arrival_radius = 10;

	relative_dir[0] *= arrival_radius;
	relative_dir[1] *= arrival_radius;

	relative_dir = round_warp_position(relative_dir);

	var removed = poi_1.extract_entity(en.uid);

	///could happen
	if(removed == null)
		return;

	removed.position = relative_dir;
	poi_2.add_entity(removed);
}

export function make_universe()
{
	return new Universe();
}
