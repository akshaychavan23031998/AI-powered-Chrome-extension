export type RepeatableFillStatus =
  | "filled"
  | "skipped"
  | "failed";

export interface RepeatableFieldFillResult {
  section: string;

  field: string;

  value?: string;

  status: RepeatableFillStatus;

  reason?: string;
}

export interface RepeatableAutofillResult {
  attemptedCount: number;

  filledCount: number;

  skippedCount: number;

  failedCount: number;

  experienceCount: number;

  educationCount: number;

  results: RepeatableFieldFillResult[];
}