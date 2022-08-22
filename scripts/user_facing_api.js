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
export function clear_actions_for(e_uid) {
    var current_actions = get_current_actions();

    for(var i=0; i < current_actions.length; i++)
    {
        if(current_actions[i].source_uid == e_uid)
        {
            current_actions.splice(i, 1);
            i--;
        }
    }

    set_current_actions(current_actions);
}

export function add_pending_action(pending_act) {
    var current_actions = get_current_actions();

    current_actions.push(pending_act);

    set_current_actions(current_actions);
}