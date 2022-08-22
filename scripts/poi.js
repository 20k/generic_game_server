import {execute_action} from "action";
import {save_uids, load_uids} from "api"
import {get_unique_id} from "get_unique_id"

export class Poi
{
	constructor()
	{
		this.position = [0, 0];
		this.name = "PoI";
		this.type = "poi"
		this.poi_name = "error name"
		this.poi_type = "error type"
		this.contents = [];
		this.uid = get_unique_id();
	}
	
	store()
	{
		var contents_uid = save_uids(this.contents);
		
		return {position:this.position, name:this.name, type:this.type, poi_name:this.poi_name, poi_type:this.poi_type, contents_uid, uid:this.uid}
	}
	
	load(obj)
	{
		this.position = obj.position;
		this.name = obj.name;
		this.type = obj.type;
		this.poi_name = obj.poi_name
		this.poi_type = obj.poi_type
		this.contents = load_uids(obj.contents_uid);
		this.uid = obj.uid;
	}
	
	take(obj) {
		this.contents.push(obj);

		return obj;
	}
	
	tick(universe, sys, elapsed_time_s) {

	}
	
	distance(e1, e2) {
		var dx = e2.position[0] - e1.position[0];
		var dy = e2.position[1] - e1.position[1];
		
		return Math.sqrt(dx * dx + dy * dy);
	}
	
	time_to_target(source, target) {
		var my_speed = source.get_speed();
		
		var dist = this.distance(source, target);
		
		if(my_speed > 0.0001)
			return dist / my_speed;
		
		return 0;
	}
	
	lookup_slow_opt(id) {
		for(var e of this.contents)
		{
			if(e.uid == id)
				return e;
		}
		
		return null;
	}
}

export function make_poi(poi_name, poi_type, position)
{	
	var poi = new Poi();
	poi.position = position;
	poi.poi_name = poi_name;
	poi.poi_type = poi_type;
	
	return poi;
}