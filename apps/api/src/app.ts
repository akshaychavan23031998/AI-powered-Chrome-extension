import cors from "cors";
import express from "express";

import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "2mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/*
 * Vercel loads app.ts directly instead of server.ts.
 * Ensure MongoDB is connected before API routes execute.
 */
app.use(
  async (
    _req,
    _res,
    next,
  ) => {
    try {
      await connectDatabase();

      next();
    } catch (error) {
      next(error);
    }
  },
);

app.get(
  "/",
  (_req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Workday AI Assistant API",
    });
  },
);

app.use(
  "/api",
  apiRouter,
);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;