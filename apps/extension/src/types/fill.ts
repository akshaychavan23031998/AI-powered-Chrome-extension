export interface FillInstruction {
  fieldId: string;

  label: string;

  kind: string;

  targetPath: string;

  value: string;

  confidence: number;

  selectorHint?: string;
}

export type FillStatus =
  | "filled"
  | "skipped"
  | "failed";

export interface FieldFillResult {
  fieldId: string;

  label: string;

  targetPath: string;

  status: FillStatus;

  expectedValue?: string;

  actualValue?: string;

  reason: string;
}

export interface AutofillResult {
  attemptedCount: number;

  filledCount: number;

  skippedCount: number;

  failedCount: number;

  results: FieldFillResult[];
}