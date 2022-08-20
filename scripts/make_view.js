function make_player_view()
{
	var obj = {};
	
	obj.is_poi_open = {};
	obj.is_sys_open = {};
	
	return obj;
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

make_player_view();