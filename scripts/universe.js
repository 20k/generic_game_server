import {get_unique_id} from "get_unique_id"
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
		this.import_all();

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

export function make_universe()
{
	return new Universe();
}
