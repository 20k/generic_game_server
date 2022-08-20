function make_system(system_name, position, uid)
{
	var obj = make_object_with_position(position);
	obj.name = "System";
	obj.type = "system";
	obj.system_name = system_name;
	obj.contents = [];
	obj.gid = 0;
	obj.uid = uid;
	
	return obj;
}

function add_poi_to_system(sys, poi)
{
	poi.uid = sys.gid++;
	
	sys.contents.push(poi);
}

function connect_systems(sys1, sys2)
{
	var warp_boundary = 100;
	
	var direction = [sys2.position[0] - sys1.position[0], sys2.position[1] - sys1.position[0]]
	
	var length = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1]);
	
	var n_dir = [direction[0] / length, direction[1] / length]
	
	var pos_in_1 = [Math.round(n_dir[0] * warp_boundary), Math.round(n_dir[1] * warp_boundary)];	
	var pos_in_2 = [-pos_in_1[0], -pos_in_1[1]]
	
	var poi_1 = make_poi("Gate to " + sys2.system_name, "warpgate", pos_in_1);
	var poi_2 = make_poi("Gate to " + sys1.system_name, "warpgate", pos_in_2);
	
	var gate_1 = make_warp_gate(sys1, sys2);
	var gate_2 = make_warp_gate(sys2, sys1);
	
	add_to_poi(poi_1, gate_1);
	add_to_poi(poi_2, gate_2);
	
	add_poi_to_system(sys1, poi_1);
	add_poi_to_system(sys2, poi_2);
}
