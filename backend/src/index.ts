import { createServer } from "http";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { setupSocketIO } from "./socketHandler.js";

const port = Number(process.env.PORT ?? 3001);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT: "${process.env.PORT}"`);

const httpServer = createServer(app);
setupSocketIO(httpServer);

httpServer.listen(port, (err?: Error) => {
  if (err) { logger.error({ err }, "Error listening"); process.exit(1); }
  logger.info({ port }, "Server listening with Socket.IO");
});
