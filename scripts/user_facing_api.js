// @ts-check

import { PendingAction } from "./action";

function get_current_actions() {
    var player_id = globalThis.player.uid;

    var t = db.read_only();
    var current_actions = t.read(2, player_id);
    t.close();

    if(current_actions == null)
        return [];

    return current_actions;
}

function set_current_actions(acts) {
    var player_id = globalThis.player.uid;

    var t2 = db.read_write();
    t2.write(2, player_id, acts);
    t2.close();
}

///design
///each user needs to be able to only write to a specific db key (?)
///which they append actions to
///currently racey, must not be run in parallel with server
///this actually isn't clearing actions, need to push a stop action
export function clear_actions_for(e_uid) {
    var pending = new PendingAction();
    pending.build_interrupt(e_uid);

    add_pending_action(pending);
}

export function add_pending_action(pending_act) {
    var current_actions = get_current_actions();

    current_actions.push(pending_act);

    set_current_actions(current_actions);
}

export function transfer_item(source_entity_uid, destination_entity_uid, cargo_uid, volume) {
    var pending = new PendingAction();
    pending.build_transfer_item(source_entity_uid, destination_entity_uid, cargo_uid, volume);

    add_pending_action(pending);
}

export function warp_to_poi(source_uid, dest_poi_uid) {
    var pending = new PendingAction();
    pending.build_warp_to_poi(source_uid, dest_poi_uid);

    add_pending_action(pending);
}

export function activate_warp_gate(source_uid, warp_gate_uid) {
    var pending = new PendingAction();
    pending.build_activate_warp_gate(source_uid, warp_gate_uid);

    add_pending_action(pending);
}