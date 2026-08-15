import {
  candidateProfileSchema,
  type CandidateProfileInput,
  type CandidateProfileOutput,
} from "../../schemas/candidate.schema.js";

export const validateCandidateProfile = (
  profile: CandidateProfileInput,
): CandidateProfileOutput => {
  return candidateProfileSchema.parse(
    profile,
  );
};