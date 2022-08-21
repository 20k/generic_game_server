exec("player_view");
exec("get_unique_id");

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
		return this;
	}
	
	load(obj)
	{	
		Object.assign(this, obj);
	}
}

export function make_player()
{
	var player = new Player();
	
	return player
}