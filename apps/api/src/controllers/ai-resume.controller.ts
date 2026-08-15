import type {
  Request,
  Response,
} from "express";

import { parseResumeWithGemini } from "../services/ai/gemini-resume.service.js";

import { normalizeGeminiCandidate } from "../services/candidate/candidate-normalizer.service.js";

import { createCandidate } from "../services/candidate/candidate.service.js";

import { extractResumeText } from "../services/resume/resume-parser.service.js";

import { ApiError } from "../utils/api-error.js";

export const parseResumeWithAi =
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    if (!req.file) {
      throw new ApiError(
        400,
        "Resume file is required.",
      );
    }

    const extraction =
      await extractResumeText(
        req.file,
      );

    const geminiCandidate =
      await parseResumeWithGemini(
        extraction.text,
      );

    const normalizedProfile =
      normalizeGeminiCandidate(
        geminiCandidate,
      );

    const candidate =
      await createCandidate(
        normalizedProfile,
        {
          fileName:
            extraction.file
              .originalName,

          mimeType:
            extraction.file
              .mimeType,

          fileSize:
            extraction.file.size,

          extractedText:
            extraction.text,
        },
      );

    res.status(201).json({
      success: true,

      message:
        "Resume parsed and candidate profile created successfully.",

      data: {
        candidateId:
          candidate._id,

        profile:
          candidate,
      },
    });
  };