function make_poi(poi_name, poi_type, position)
{
	var obj = make_object_with_position(position);
	obj.name = "PoI";
	obj.type = "poi";
	obj.poi_name = poi_name;
	obj.poi_type = poi_type;
	obj.contents = [];
	
	return obj;
}

function add_to_poi(poi, obj)
{
	poi.contents.push(obj);
}