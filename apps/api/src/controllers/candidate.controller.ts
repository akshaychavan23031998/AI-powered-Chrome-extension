import type {
  Request,
  Response,
} from "express";

import {
  createCandidate,
  getCandidateById,
} from "../services/candidate/candidate.service.js";
import { ApiError } from "../utils/api-error.js";

export const createCandidateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const candidate =
    await createCandidate(req.body);

  res.status(201).json({
    success: true,
    message:
      "Candidate profile created successfully.",
    data: candidate,
  });
};

export const getCandidateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const candidateId =
    req.params.candidateId;

  if (
    !candidateId ||
    Array.isArray(candidateId)
  ) {
    throw new ApiError(
      400,
      "Invalid candidate ID.",
    );
  }

  const candidate =
    await getCandidateById(candidateId);

  if (!candidate) {
    throw new ApiError(
      404,
      "Candidate profile not found.",
    );
  }

  res.status(200).json({
    success: true,
    data: candidate,
  });
};