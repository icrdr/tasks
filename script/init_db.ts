import { createDb } from "../src/db";
createDb()
  .then(async (db) => {
    await db.clear();
    console.log("database cleared");

    await db.createDefault();
    console.log("database updated");
  })
  .catch((error) => {
    console.log(error);
  })
  .finally(() => {
    process.exit(0);
  });
