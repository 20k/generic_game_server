/*function get_object(uid)
{
	var transact = db.read_only();

	var result = transact.read(1, uid);

	transact.close();
	
	return result;
}

function store_object(e)
{
	var transact = db.read_write();
	
	transact.write(1, e.uid, e);
	
	transact.close();
	
	return result
}*/

import {Universe} from "universe";
import {System} from "system";
import {Poi} from "poi"
import {Asteroid, Station, Warpgate, Ship} from "object"
import {Player} from "player"
import {set_debug} from "debug"
import {Action} from "action";

export function get_by_key(uid)
{
	var transact = db.read_only();

	var result = transact.read(1, uid);

	transact.close();
	
	return result;
}

export function store_key_value(uid, e)
{
	var transact = db.read_write();
	
	transact.write(1, uid, e);
	
	transact.close();
}

export function load_object(uid)
{
	var val = get_by_key(uid);
	var as_class = allocate_class(val.type);
	as_class.uid = uid;
	val.uid = uid;
	
	as_class.load(val);
	return as_class;
}

export function save_uids(arr)
{
	var arr_uid = [];
	
	for(var e of arr)
	{	
		var to_store = e.store();
		to_store.uid = e.uid;
		
		store_key_value(e.uid, to_store);
		
		arr_uid.push(e.uid);
	}
	
	return arr_uid;
}

export function load_uids(arr_uid)
{
	var arr = [];
	
	for(var uid of arr_uid)
	{
		arr.push(load_object(uid));
	}
	
	return arr;
}

function allocate_class(type)
{
	if(type == "universe")
	{
		return new Universe();
	}
	
	if(type == "system")
	{
		return new System();
	}
	
	if(type == "poi")
	{
		return new Poi();
	}
	
	if(type == "asteroid")
	{
		return new Asteroid();
	}
	
	if(type == "station")
	{
		return new Station();
	}
	
	if(type == "warpgate")
	{
		return new Warpgate();
	}
	
	if(type == "ship")
	{
		return new Ship();
	}
	
	if(type == "player")
	{
		return new Player();
	}
	
	if(type == "action")
	{
		return new Action();
	}
		
	return null;
}

export function fix_class(obj)
{
	var object = allocate_class(obj.type);
	
	Object.assign(object, obj);
	
	return object;
}

export function fix_class_array(arr)
{
	for(var i=0; i < arr.length; i++)
	{
		arr[i] = fix_class(arr[i]);
	}
}