import { Router } from "express";

import { extractResume } from "../controllers/resume.controller.js";
import { resumeUpload } from "../middleware/resume-upload.middleware.js";

export const resumeRouter = Router();

resumeRouter.post(
  "/extract",
  resumeUpload.single("resume"),
  extractResume,
);