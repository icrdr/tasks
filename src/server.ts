import { Config } from "./config";
import { logger } from "./logger";

import { createApp } from "./app";
import { createDb } from "./db";
import { Container } from "typedi";

const config = Container.get(Config);

createDb().then(() => {
  logger.info("Successfully connect to database.");
  const app = createApp();
  app.listen(config.port);
  logger.info(`App started at port http://localhost:${config.port}`);
});
