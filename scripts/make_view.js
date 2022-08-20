function make_player_view()
{
	var obj = {};
	
	obj.is_poi_open = {};
	obj.is_sys_open = {};
	
	return obj;
}

function view_is_poi_open(view, sys, poi)
{
	var p_1 = view.is_poi_open[sys.uid];
	
	if(p_1 === undefined)
		return false;
	
	var p_2 = p_1[poi.uid];
	
	if(p_2 === undefined)
		return false;
	
	return p_2;
}

function view_set_is_poi_open(view, sys, poi, is_open)
{
	if(view.is_poi_open[sys.uid] === undefined)
	{
		view.is_poi_open[sys.uid] = {};
	}
	
	if(view.is_poi_open[sys.uid][poi.uid] === undefined)
	{
		view.is_poi_open[sys.uid][poi.uid] = false;
	}
	
	view.is_poi_open[sys.uid][poi.uid] = is_open;
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