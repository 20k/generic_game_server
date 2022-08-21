/*function get_object(uid)
{
	var transact = db.read_only();

	var result = transact.read(1, uid);

	transact.close();
	
	return result;
}

function store_object(e)
{
	var transact = db.read_write();
	
	transact.write(1, e.uid, e);
	
	transact.close();
	
	return result
}*/

function get_by_key(uid)
{
	var transact = db.read_only();

	var result = transact.read(1, uid);

	transact.close();
	
	return result;
}

function store_key_value(uid, e)
{
	var transact = db.read_write();
	
	transact.write(1, uid, e);
	
	transact.close();
}