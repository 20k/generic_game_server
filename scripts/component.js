// @ts-check

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

    build(dynamic_in, static_in, resource_in, cost_in) {
        this.data_dynamic = dynamic_in;
        this.data_static = static_in;
        this.data_resource = resource_in;
        this.data_cost = cost_in;
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
    stat.category = "warpdrive";

    var c = new component();
    c.build({}, stat, {}, cost);

    return c;
}

///specific weapons, eg large_laser or lrm32 or something
export function get_component_by_name(name) {
    if(name == "cargo") {
        return make_cargo_default(name, 10, {});
    }

    if(name == "thruster") {
        return make_thruster_default(name, 1, {});
    }

    if(name == "warpdrive") {
        return make_warp_drive_default(name, 1, {});
    }

    print("Err");
}

export function save_component(full_obj) {
    return {name:full_obj.data_static.name, dyn:full_obj.data_dynamic};
}

export function load_component(reduced_obj) {
    var name = reduced_obj.name;
    var dyn = reduced_obj.dyn;

    var default_object = get_component_by_name(name);
    default_object.data_dynamic = dyn;

    return default_object;
}

export function save_components(arr) {
    var ret = [];

    for(var e of arr) {
        ret.push(save_component(e));
    }

    return ret;
}

export function load_components(arr) {
    var ret = [];

    for(var e of arr) {
        ret.push(load_component(e));
    }

    return ret;
}