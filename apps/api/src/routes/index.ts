import { Router } from "express";

import { candidateRouter } from "./candidate.routes.js";
import { healthRouter } from "./health.routes.js";
import { resumeRouter } from "./resume.routes.js";

export const apiRouter = Router();

apiRouter.use(
  "/health",
  healthRouter,
);

apiRouter.use(
  "/resumes",
  resumeRouter,
);

apiRouter.use(
  "/candidates",
  candidateRouter,
);