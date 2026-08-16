export type MappingSource =
  | "heuristic"
  | "ai"
  | "unmapped";

export interface CandidateFieldMapping {
  fieldId: string;

  label: string;

  kind: string;

  targetPath?: string;

  value?: string;

  confidence: number;

  source: MappingSource;

  reason: string;

  requiresReview: boolean;

  shouldFill: boolean;
}

export interface FieldMappingResult {
  candidateId: string;

  totalFields: number;

  mappedCount: number;

  highConfidenceCount: number;

  reviewCount: number;

  mappings: CandidateFieldMapping[];
}