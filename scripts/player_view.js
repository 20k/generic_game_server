// @ts-check

import {get_unique_id} from "./get_unique_id"

export class PlayerView
{
	constructor() {
		this.uid_open = {};
		this.poi_open = {};
		this.sys_open = {};
		this.type = "playerview";
		this.uid = get_unique_id();
	}

	is_uid_open(id) {
		if(this.uid_open == undefined)
			return false;

		return this.uid_open[id];
	}

	set_uid_open(id, is_open) {
		this.uid_open[id] = is_open;
	}

	is_poi_open(sys, poi) {
		var p_1 = this.poi_open[sys.uid];

		if(p_1 === undefined)
			return false;

		var p_2 = p_1[poi.uid];

		if(p_2 === undefined)
			return false;

		return p_2;
	}

	set_is_poi_open(sys, poi, is_open) {
		if(this.poi_open[sys.uid] === undefined)
		{
			this.poi_open[sys.uid] = {};
		}

		if(this.poi_open[sys.uid][poi.uid] === undefined)
		{
			this.poi_open[sys.uid][poi.uid] = false;
		}

		this.poi_open[sys.uid][poi.uid] = is_open;
	}

	is_sys_open(sys) {
		if(this.sys_open[sys.uid] == undefined)
			return false;

		return this.sys_open[sys.uid];
	}

	set_is_sys_open(sys, is_open) {
		this.sys_open[sys.uid] = is_open;
	}

	store() {
		return this;
	}

	load(obj) {
		Object.assign(this, obj);
	}
}

export function make_player_view()
{
	return new PlayerView();
}

/*function player_open(obj, poi)
{
	obj.is_open.set(poi.uid, true);
}

function player_close(obj, poi)
{
	obj.is_open.set(poi.uid, false);
}

function player_set_open(obj, poi, val)
{
	obj.is_open.set(poi.uid, val);
}

function player_is_open(obj, poi)
{
	if(!obj.is_open.has(poi.uid))
		return false;

	return obj.is_open.get(poi.uid);
}*/
