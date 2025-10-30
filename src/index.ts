import { createServer } from "./server.js";
import { env } from "./config/env.js";
import { logger } from "./logger.js";

createServer()
  .then((app) => {
    app.listen(env.PORT, () => {
      logger.info(`✅ API listening on http://localhost:${env.PORT}`);
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  });
