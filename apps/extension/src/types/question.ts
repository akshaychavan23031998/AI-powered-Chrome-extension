export type QuestionCategory =
  | "authorization"
  | "sponsorship"
  | "previousEmployment"
  | "source"
  | "consent"
  | "custom"
  | "sensitive";

export type QuestionSensitivity =
  | "normal"
  | "sensitive";

export type QuestionControlKind =
  | "radio"
  | "checkbox"
  | "select"
  | "combobox"
  | "text"
  | "textarea"
  | "unknown";

export interface DetectedQuestion {
  id: string;

  label: string;

  normalizedLabel: string;

  category: QuestionCategory;

  sensitivity: QuestionSensitivity;

  controlKind: QuestionControlKind;

  required: boolean;

  answered: boolean;

  currentValue?: string;

  options: string[];

  selectorHint?: string;
}

export interface QuestionScanResult {
  url: string;

  title: string;

  scannedAt: string;

  questionCount: number;

  normalCount: number;

  sensitiveCount: number;

  answeredCount: number;

  unansweredCount: number;

  questions: DetectedQuestion[];
}

export interface SavedQuestionAnswer {
  category: QuestionCategory;

  questionLabel?: string;

  value: string;

  explicitUserAnswer: boolean;
}

export interface QuestionAnswerProfile {
  answers: SavedQuestionAnswer[];
}

export type QuestionFillStatus =
  | "filled"
  | "skipped"
  | "failed"
  | "manualReview";

export interface QuestionFillItemResult {
  questionId: string;

  label: string;

  category: QuestionCategory;

  status: QuestionFillStatus;

  value?: string;

  reason?: string;
}

export interface QuestionAutofillResult {
  attemptedCount: number;

  filledCount: number;

  skippedCount: number;

  failedCount: number;

  manualReviewCount: number;

  results: QuestionFillItemResult[];

  scan: QuestionScanResult;
}