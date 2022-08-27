class component_construction_cost {

}

class component_resource {

}

class component_static {
    constructor() {
        this.name = "No Name"
        this.category = "none";
    }
}

class component_dynamic {

}

class component {
    constructor() {
        this.data_dynamic = {};
        this.data_static = {};
        this.data_resource = {};
        this.data_cost = {};
    }

    build(dynamic, static, resource, cost) {
        this.data_dynamic = dynamic;
        this.data_static = static;
        this.data_resource = resource;
        this.data_cost = cost;
    }
}

function make_cargo_default(name, max_cargo, cost) {
    var stat = {};
    stat.max = max_cargo;
    stat.name = name;
    stat.category = "cargo";

    var c = new component();
    c.build({}, stat, {}, cost);

    return c;
}

function make_thruster_default(name, speed, cost) {
    var stat = {};
    stat.speed = speed;
    stat.name = name;
    stat.category = "thruster";

    var c = new component();
    c.build({}, stat, {}, cost);

    return c;
}

function make_warp_drive_default(name, speed, cost) {
    var stat = {};
    stat.speed = speed;
    stat.name = name;
    stat.category = "warpderive";

    var c = new component();
    c.build({}, stat, {}, cost);

    return c;
}

export function get_component_by_name(name) {
    if(name == "cargo_example") {
        return make_cargo_default(name, 15, {});
    }

    if(name == "thruster") {
        return make_thruster_default(name, 1, {});
    }

    if(name == "warpdrive") {
        return make_warp_drive_default(name, 1, {});
    }

    print("Err");
}