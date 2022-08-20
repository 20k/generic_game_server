exec("player_view");

function make_player(uid)
{
	var player = {
		view: make_player_view(),
		uid: uid,
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