function make_system(system_name, position, uid)
{
	var obj = {
		position:position,
		name:"System",
		type:"system",
		system_name:system_name,
		contents:[],
		gid:0, //for local system content
		uid:uid,
		
		take_poi(poi) {
			poi.uid = this.gid++;
	
			this.contents.push(poi);
		}
	};
	
	return obj;
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
	
	poi_1.take(gate_1);
	poi_2.take(gate_2);
	
	sys1.take_poi(poi_1);
	sys2.take_poi(poi_2);
}
