import mongoose from "mongoose";

import { Candidate } from "../../models/candidate.model.js";

import {
  candidateProfileSchema,
  type CandidateProfileInput,
} from "../../schemas/candidate.schema.js";

import { ApiError } from "../../utils/api-error.js";

export interface ResumeMetadata {
  fileName: string;
  mimeType: string;
  fileSize: number;
  extractedText: string;
}

export const createCandidate = async (
  profile: CandidateProfileInput,
  resume?: ResumeMetadata,
) => {
  const validatedProfile =
    candidateProfileSchema.parse(
      profile,
    );

  const candidate =
    await Candidate.create({
      ...validatedProfile,

      ...(resume && {
        resume,
      }),
    });

  return candidate;
};

export const getCandidateById = async (
  candidateId: string,
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      candidateId,
    )
  ) {
    throw new ApiError(
      400,
      "Invalid candidate ID.",
    );
  }

  return Candidate.findById(
    candidateId,
  );
};