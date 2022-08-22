exec("get_unique_id")

import {load_object, save_uids, load_uids} from "api"

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
		for(var sys of this.contents)
		{
			sys.tick(this, delta_time_s);
		}
	}
	
	store()
	{
		var contents_uid = save_uids(this.contents);
				
		return {type:this.type, uid:this.uid, contents_uid}
	}
	
	load(obj)
	{		
		this.uid = obj.uid;		
		this.contents = load_uids(obj.contents_uid)
	}
}

export function make_universe()
{
	return new Universe();
}
