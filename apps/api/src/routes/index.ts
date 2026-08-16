import {
  Router,
} from "express";

import {
  aiResumeRouter,
} from "./ai-resume.routes.js";

import {
  candidateRouter,
} from "./candidate.routes.js";

import {
  fieldMappingRouter,
} from "./field-mapping.routes.js";

import {
  healthRouter,
} from "./health.routes.js";

import {
  resumeRouter,
} from "./resume.routes.js";

export const apiRouter =
  Router();

apiRouter.use(
  "/health",
  healthRouter,
);

apiRouter.use(
  "/resumes",
  resumeRouter,
);

apiRouter.use(
  "/ai/resumes",
  aiResumeRouter,
);

apiRouter.use(
  "/ai/fields",
  fieldMappingRouter,
);

apiRouter.use(
  "/candidates",
  candidateRouter,
);