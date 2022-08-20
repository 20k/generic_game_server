var transact = db.read_write();

transact.write(0, "reset", 1);

transact.close();

undefined