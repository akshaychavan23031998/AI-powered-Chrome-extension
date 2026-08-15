import { Router } from "express";

import { parseResumeWithAi } from "../controllers/ai-resume.controller.js";

import { resumeUpload } from "../middleware/resume-upload.middleware.js";

export const aiResumeRouter =
  Router();

aiResumeRouter.post(
  "/parse",
  resumeUpload.single(
    "resume",
  ),
  parseResumeWithAi,
);