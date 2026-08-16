export type WorkdayStepKind =
  | "myInformation"
  | "myExperience"
  | "applicationQuestions"
  | "voluntaryDisclosures"
  | "selfIdentify"
  | "review"
  | "unknown";

export interface WorkdayStepDescriptor {
  kind: WorkdayStepKind;

  title: string;

  index?: number;

  totalSteps?: number;

  isCurrent: boolean;

  isCompleted: boolean;
}

export interface WorkdayNavigationState {
  url: string;

  pageTitle: string;

  scannedAt: string;

  currentStep: WorkdayStepKind;

  currentStepTitle: string;

  currentStepIndex?: number;

  totalSteps?: number;

  steps: WorkdayStepDescriptor[];

  canGoBack: boolean;

  canContinue: boolean;

  submitDetected: boolean;

  continueButtonText?: string;

  backButtonText?: string;
}

export interface WorkdayNavigationResult {
  action:
    | "back"
    | "continue";

  navigated: boolean;

  previousStep: WorkdayStepKind;

  currentStep: WorkdayStepKind;

  reason: string;

  state: WorkdayNavigationState;
}