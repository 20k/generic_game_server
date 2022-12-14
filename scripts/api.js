// @ts-check

import {Universe} from "./universe";
import {System} from "./system";
import {Poi} from "./poi"
import {Asteroid, Station, Warpgate, Ship} from "./object"
import {Player} from "./player"
import {set_debug} from "./debug"
import {Action, ActionMan} from "./action";
import {PlayerView} from "./player_view";
import {set_defer_uids} from "./get_unique_id";
import {Item, ItemMan} from "./item";

export function get_by_key(uid)
{
	// @ts-ignore
	var transact = db.read_only();

	var result = transact.read(1, uid);

	transact.close();

	return result;
}

export function store_key_value(uid, e)
{
	// @ts-ignore
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

function allocate_class(type) {
    const classes = {
        universe: Universe,
        system: System,
        poi: Poi,
        asteroid: Asteroid,
        station: Station,
        warpgate: Warpgate,
        ship: Ship,
        player: Player,
        action: Action,
        actionman: ActionMan,
        playerview: PlayerView,
        item: Item,
        itemman: ItemMan,
    }

    const entity_class = classes[type]

    if (!entity_class) {
        // @ts-ignore
        print(`bad type: "${type}"`)
        return null
    }

    return new entity_class
}