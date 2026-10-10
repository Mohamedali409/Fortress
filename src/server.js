import "dotenv/config";
import { pathToFileURL } from "node:url";

import app from "./app.js";
import connectDB, { disconnectDB } from "./config/db.js";

const SHUTDOWN_TIMEOUT_MS = 10000;

let server = null;
let shuttingDown = null;

const startServer = async () => {
  try {
    await connectDB();

    const port = process.env.PORT || 3000;

    server = await new Promise((resolve, reject) => {
      const instance = app.listen(port, () => resolve(instance));
      instance.once("error", reject);
    });

    console.log(`Server running in port ${server.address().port}`);
    return server;
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

// Graceful shutdown: stop accepting requests, let in-flight ones finish,
// then close the database connection. Safe to call more than once.
const endServer = async (signal) => {
  if (shuttingDown) return shuttingDown;

  shuttingDown = (async () => {
    if (signal) console.log(`${signal} received. Shutting down...`);

    let forceTimer;
    try {
      if (server) {
        await new Promise((resolve, reject) => {
          // Force-close lingering connections if they do not finish in time.
          forceTimer = setTimeout(
            () => server.closeAllConnections(),
            SHUTDOWN_TIMEOUT_MS,
          );
          forceTimer.unref();

          server.close((err) => (err ? reject(err) : resolve()));
          server.closeIdleConnections();
        });
        console.log("HTTP server closed");
      }

      await disconnectDB();
    } finally {
      clearTimeout(forceTimer);
      server = null;
      shuttingDown = null;
    }
  })();

  return shuttingDown;
};

const handleSignal = async (signal) => {
  try {
    await endServer(signal);
    process.exit(0);
  } catch (error) {
    console.error("Shutdown failed:", error.message);
    process.exit(1);
  }
};

// Only boot automatically when run directly (npm start / npm run dev),
// not when imported by tests.
const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  process.on("SIGINT", () => handleSignal("SIGINT"));
  process.on("SIGTERM", () => handleSignal("SIGTERM"));
  startServer();
}

export { startServer, endServer };
