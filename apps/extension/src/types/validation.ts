export type ValidationSeverity =
  | "error"
  | "warning";

export type ValidationIssueType =
  | "required"
  | "invalid"
  | "page-error"
  | "unanswered"
  | "navigation"
  | "unknown";

export interface ValidationIssue {
  id: string;
  type: ValidationIssueType;
  severity: ValidationSeverity;
  message: string;
  label?: string;
  selectorHint?: string;
}

export interface WorkdayValidationResult {
  url: string;
  title: string;
  scannedAt: string;

  valid: boolean;

  errorCount: number;
  warningCount: number;

  issues: ValidationIssue[];
}