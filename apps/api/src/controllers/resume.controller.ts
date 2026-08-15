import type { Request, Response } from "express";

import { extractResumeText } from "../services/resume/resume-parser.service.js";
import { ApiError } from "../utils/api-error.js";

export const extractResume = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.file) {
    throw new ApiError(
      400,
      "Resume file is required.",
    );
  }

  const result =
    await extractResumeText(req.file);

  res.status(200).json({
    success: true,
    message: "Resume text extracted successfully.",
    data: result,
  });
};