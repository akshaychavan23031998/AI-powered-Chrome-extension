export type RecoveryFailureReason =
  | "timeout"
  | "element-not-found"
  | "element-not-visible"
  | "validation-blocked"
  | "navigation-stalled"
  | "dom-not-ready"
  | "operation-failed"
  | "unknown";

export interface RecoveryAttempt {
  attempt: number;
  success: boolean;
  message: string;
  timestamp: string;
}

export interface RecoveryResult {
  success: boolean;
  reason?: RecoveryFailureReason;
  attempts: RecoveryAttempt[];
  totalAttempts: number;
  finalMessage: string;
}

export interface RetryOptions {
  attempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

export interface WaitOptions {
  timeoutMs?: number;
  intervalMs?: number;
}

export interface WorkdayRecoveryOptions
  extends RetryOptions {
  waitForDomMs?: number;
}