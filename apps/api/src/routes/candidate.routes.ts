import { Router } from "express";

import {
  createCandidateProfile,
  getCandidateProfile,
} from "../controllers/candidate.controller.js";

export const candidateRouter = Router();

candidateRouter.post(
  "/",
  createCandidateProfile,
);

candidateRouter.get(
  "/:candidateId",
  getCandidateProfile,
);