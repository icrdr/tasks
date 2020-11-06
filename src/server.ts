import { config } from "./config";
import { logger } from "./logger";

import { createApp } from "./app";
import { createDb } from "./db";

createDb().then(() => {
  logger.info("Successfully connect to database.");
  const app = createApp();
  app.listen(config.port);
  logger.info(`App started at port http://localhost:${config.port}`);
});
