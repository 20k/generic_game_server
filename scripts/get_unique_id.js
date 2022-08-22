//globalThis.globally_unique = 0;

export function get_unique_id()
{
	var t = db.read_write();

	var gid = t.read(3, 1);

	if(gid == null)
		gid = 0.;

	t.write(3, 1, gid + 1);

	t.close();

	return gid;

	//return globalThis.globally_unique++;
}