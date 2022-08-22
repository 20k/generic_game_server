import {make_poi} from "poi";
import {make_warp_gate} from "object"
import {load_object, save_uids, load_uids} from "api"
import {set_debug} from "debug"

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
	}
	
	take_poi(poi) {
		this.contents.push(poi);
		
		return poi;
	}
	
	tick(universe, elapsed_time_s) {
		for(var poi of this.contents) {
			poi.tick(universe, this, elapsed_time_s);
		}
	}
	
	store()
	{		
		var contents_uid = save_uids(this.contents);
		
		return {position:this.position, name:this.name, type:this.type, system_name:this.system_name, contents_uid:contents_uid, uid:this.uid}
	}
	
	load(obj)
	{			
		this.position = obj.position;
		this.name = obj.name;
		this.type = obj.type;
		this.system_name = obj.system_name
		this.contents = load_uids(obj.contents_uid);
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

export function connect_systems(sys1, sys2)
{
	var warp_boundary = 100;
	
	var direction = [sys2.position[0] - sys1.position[0], sys2.position[1] - sys1.position[0]]
	
	var length = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1]);
	
	var n_dir = [direction[0] / length, direction[1] / length]
	
	var pos_in_1 = [Math.round(n_dir[0] * warp_boundary), Math.round(n_dir[1] * warp_boundary)];	
	var pos_in_2 = [-pos_in_1[0], -pos_in_1[1]]
	
	var poi_1 = make_poi("Gate to " + sys2.system_name, "warpgate", pos_in_1);
	var poi_2 = make_poi("Gate to " + sys1.system_name, "warpgate", pos_in_2);
	
	var gate_1 = make_warp_gate(sys1, sys2);
	var gate_2 = make_warp_gate(sys2, sys1);
	
	poi_1.take(gate_1);
	poi_2.take(gate_2);
	
	sys1.take_poi(poi_1);
	sys2.take_poi(poi_2);
}
