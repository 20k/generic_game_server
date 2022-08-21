exec("player_view");
exec("get_unique_id");

function make_player()
{
	var player = {
		view: make_player_view(),
		uid: get_unique_id(),
		controlling:-1,
		
		take_ownership(obj) {
			obj.owner = this.uid;
		},
		
		take_control(obj) {
			this.controlling = obj.uid;
		},
		
		release_control(obj) {
			this.controlling = -1;
		}
	}
	
	return player
}