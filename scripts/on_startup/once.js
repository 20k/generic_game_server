var transact = db.read_write();

transact.write(0, "hello", "something fun");

transact.close();


