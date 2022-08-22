import {get_unique_id} from "get_unique_id";
import {save_uids, load_uids} from "api"

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
            if(item_compatible(e, item))
            {

            }
        }
    }

    fill_items(items) {
        for(var e of items) {
            this.fill_item(e);
        }
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
    if(amount > item.volume) {
		amount = this.volume;
	}

    var result = new Item();
    result.make_ore(item.ore_type, item.ore_name, amount);

	item.volume -= amount;;

	return result;
}

export function fill_asteroid(asteroid, ore_name, ore_type, ore_amount) {
    var item = new Item();
    item.make_ore(ore_type, ore_name, ore_amount);

    asteroid.cargo.add_item(item);
    asteroid.cargo.storage = item.volume;
}