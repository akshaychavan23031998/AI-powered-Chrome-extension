import { app } from "./app.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./config/database.js";
import { env } from "./config/env.js";

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      console.log(
        `API running at http://localhost:${env.PORT}`,
      );
    });

    const shutdown = async (
      signal: string,
    ): Promise<void> => {
      console.log(`\n${signal} received. Shutting down...`);

      server.close(async () => {
        await disconnectDatabase();

        console.log("Server stopped");

        process.exit(0);
      });
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("Failed to start API");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
};

void startServer();