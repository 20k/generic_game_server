import {Universe} from "universe";
import {System} from "system";
import {Poi} from "poi"
import {Asteroid, Station, Warpgate, Ship} from "object"
import {Player} from "player"
import {set_debug} from "debug"
import {Action, ActionMan} from "action";
import {PlayerView} from "player_view";
import {set_defer_uids} from "get_unique_id";
import {Item, ItemMan} from "item";

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

export function store_object(e)
{
	var to_store = e.store();
	to_store.uid = e.uid;
	to_store.type = e.type;

	store_key_value(e.uid, to_store);

	return e.uid;
}

export function load_object(uid)
{
	var val = get_by_key(uid);

	set_defer_uids(true);
	var as_class = allocate_class(val.type);
	set_defer_uids(false);

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
		store_object(e);

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

	if(type == "actionman")
	{
		return new ActionMan();
	}

	if(type == "playerview")
	{
		return new PlayerView();
	}

	if(type == "item")
	{
		return new Item();
	}

	if(type == "itemman")
	{
		return new ItemMan();
	}

	print("Bad type " + type);

	return null;
}