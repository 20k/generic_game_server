import {get_unique_id} from "get_unique_id";
import {save_uids, load_uids} from "api"

export function round_volume(volume) {
    return Math.round(volume * 100) / 100;
}

export class Item {
    constructor() {
        this.uid = get_unique_id();
        this.type = "item";

        this.name = "no name";
        this.subtype = "";
        this.volume = 0;
    }

    make_ore(ore_type, ore_name, ore_amount) {
        this.name = "Ore";
        this.subtype = "ore";
        this.volume = ore_amount;

        this.ore_type = ore_type;
        this.ore_name = ore_name;
    }

    format() {
        if(this.subtype == "ore") {
            return `${this.ore_name} ore (${this.volume})`
        }

        return this.name;
    }

    store() {
        return this;
    }

    load(obj) {
        Object.assign(this, obj);
    }
}

function item_storage_compatible(i1, i2) {
    if(i1.subtype != i2.subtype)
         return false;

    if(i1.subtype == "ore") {
        return i1.ore_type == i2.ore_type;
    }

    return false;
}

export class ItemMan {
    constructor() {
        this.uid = get_unique_id();
        this.type = "itemman";

        this.name = "Cargo";
        this.storage = 0;
        this.stored = [];
    }

    add_item(item) {
        this.stored.push(item);
    }

    add_items(items) {
        this.stored = this.stored.concat(items);
    }

    fill_item(item) {
        for(var e of this.stored) {
            if(item_storage_compatible(e, item)) {
                e.volume += item.volume;
                e.volume = round_volume(e.volume);
                return;
            }
        }

        this.add_item(item);
    }

    fill_items(items) {
        for(var e of items) {
            this.fill_item(e);
        }
    }

    find_by_id(item_uid) {
        for(var e of this.stored) {
            if(e.uid == item_uid)
                return e;
        }

        return null;
    }

    take_volume_by_id(item_uid, volume) {
        volume = round_volume(volume);

        var data = this.find_by_id(item_uid);

        if(data == null)
            return null;

        var takeable_volume = Math.min(volume, data.volume);

        var result = new Item();
        Object.assign(result, data);

        result.volume = takeable_volume;
        data.volume -= takeable_volume;

        result.volume = round_volume(result.volume);
        data.volume = round_volume(data.volume);

        return result;
    }

    store() {
        var cargo_ids = save_uids(this.stored);

        return {uid:this.uid, type:this.type, storage:this.storage, s_uids:cargo_ids};
    }

    load(obj) {
        var cargo = load_uids(obj.s_uids);

        ///think uid here is unnecssary
        this.uid = obj.uid;
        this.storage = obj.storage;
        this.stored = cargo;
    }
}

export function take_ore_amount(item, amount) {
    amount = round_volume(amount);

    if(amount > item.volume) {
		amount = this.volume;
	}

    var result = new Item();
    result.make_ore(item.ore_type, item.ore_name, amount);

	item.volume -= amount;

    item.volume = round_volume(item.volume);
    result.volume = round_volume(result.volume);

	return result;
}

export function fill_asteroid(asteroid, ore_name, ore_type, ore_amount) {
    var item = new Item();
    item.make_ore(ore_type, ore_name, ore_amount);

    asteroid.cargo.add_item(item);
    asteroid.cargo.storage = item.volume;
}