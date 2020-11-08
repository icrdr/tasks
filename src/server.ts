import { logger } from "./logger";
import { createApp } from "./app";
import { createDb } from "./db";

async function bootstrap(port: number) {
  await createDb();
  logger.info("Successfully connect to database.");
  const app = createApp();
  app.listen(port);
  logger.info(`App started at port http://localhost:${port}`);
}

bootstrap(3000);
