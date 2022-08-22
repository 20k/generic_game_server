exec("get_unique_id");

import {make_player_view} from "player_view"
import {load_object, store_object} from "api";

export class Player
{
	constructor()
	{
		this.view = make_player_view();
		this.type = "player";
		this.uid = get_unique_id();
		this.controlling = -1;
	}
	
	take_ownership(obj) {
		obj.owner = this.uid;
	}
	
	take_control(obj) {
		this.controlling = obj.uid;
	}
	
	release_control(obj) {
		this.controlling = -1;
	}
	
	store()
	{
		var stored = store_object(this.view);
		
		return {type:this.type, uid:this.uid, controlling:this.controlling, view_uid:stored};
	}
	
	load(obj)
	{	
		this.uid = obj.uid;
		this.controlling = obj.controlling;
		this.view = load_object(obj.view_uid);
	}
}

export function make_player()
{
	var player = new Player();
	
	return player
}