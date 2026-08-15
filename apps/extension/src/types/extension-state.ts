export interface CandidateSummary {
  candidateId: string;

  firstName: string;

  lastName: string;

  email?: string;
}

export interface ExtensionState {
  backendConnected: boolean;

  workdayDetected: boolean;

  candidate?: CandidateSummary;

  lastError?: string;
}

export const DEFAULT_EXTENSION_STATE: ExtensionState = {
  backendConnected: false,
  workdayDetected: false,
};