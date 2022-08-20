function make_poi(poi_name, poi_type, position)
{
	var obj = {
		position:position,
		name:"PoI",
		type:"poi",
		poi_name:poi_name,
		poi_type:poi_type,
		contents:[],
		
		take(obj) {
			this.contents.push(obj);			
		}
	};
	
	return obj;
}