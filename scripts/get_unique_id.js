// @ts-check

//globalThis.globally_unique = 0;

var defer_uids = false;

export function set_defer_uids(val) {
	defer_uids = val;
}

export function get_unique_id()
{
	if(defer_uids == true) {
		return -1;
	}

	var t = db.read_write();

	var gid = t.read(3, 1);

	if(gid == null)
		gid = 0.;

	t.write(3, 1, gid + 1);

	t.close();

	return gid;

	//return globalThis.globally_unique++;
}