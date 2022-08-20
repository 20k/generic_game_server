exec("player_view");

function make_player(uid)
{
	var player = {};
	player.view = make_player_view();
	player.uid = uid;
	
	return player
}