import Container from "typedi";
import { createDb, DbDriver } from "../src/db";

const initDatabase = async () => {
  const db = await createDb();
  await db.clear();
  console.log("database cleared");
  await db.createDefault();
  console.log("database updated");
};

initDatabase()
  .catch((err) => console.log(err))
  .finally(() => process.exit(0));
