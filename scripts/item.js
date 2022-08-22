import {get_unique_id} from "get_unique_id";

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
        this.ore_amount = ore_amount;
    }

    store() {
        return this;
    }

    load(obj) {
        Object.assign(this, obj);
    }
}

export function take_ore_amount(item, amount) {
    if(amount > item.ore_amount) {
		amount = this.ore_amount;
	}

    var result = new Item();
    result.make_ore(item.ore_type, item.ore_name, amount);

	item.ore_amount -= amount;
	item.volume = item.ore_amount;

	return result;
}

export function fill_asteroid(asteroid, ore_name, ore_type, ore_amount) {
    var item = new Item();
    item.make_ore(ore_type, ore_name, ore_amount);

    asteroid.ores.push(item);
}