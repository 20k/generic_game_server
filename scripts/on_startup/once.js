var transact = start_transaction(true);

transact.write(0, "hello", "something fun");

close_transaction(transact);


