export interface CandidateSummary {
  candidateId: string;

  firstName?: string;

  middleName?: string;

  lastName?: string;

  email?: string;

  title?: string;

  skills?: string[];

  resumeFileName?: string;
}

export interface ExtensionState {
  backendConnected: boolean;

  workdayDetected: boolean;

  candidateId?: string;

  candidate?: CandidateSummary;

  lastError?: string;
}

export const DEFAULT_EXTENSION_STATE:
  ExtensionState = {
    backendConnected: false,
    workdayDetected: false,
  };