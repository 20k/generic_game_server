exec("player_view");

function make_player(uid)
{
	var player = {
		view: make_player_view(),
		uid: uid,
		
		take_ownership(obj) {
			obj.uid = uid;
		}
	}
	
	return player
}