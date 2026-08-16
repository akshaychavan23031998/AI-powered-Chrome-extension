import type {
  CandidateProfile,
} from "./candidate";

import type {
  WorkdayScanResult,
} from "./dom-field";

import type {
  AutofillResult,
  FillInstruction,
} from "./fill";

import type {
  FieldMappingResult,
} from "./mapping";

import type {
  WorkdayNavigationResult,
  WorkdayNavigationState,
} from "./navigation";

import type {
  QuestionScanResult,
} from "./question";

import type {
  AddRepeatableEntryResult,
  DynamicSectionScanResult,
  RepeatableSectionKind,
} from "./repeatable";

import type {
  RepeatableAutofillResult,
} from "./repeatable-fill";

import type {
  WorkdayReviewResult,
  WorkdaySubmitResult,
} from "./review";

import type {
  WorkdayValidationResult,
} from "./validation";

export type ExtensionMessage =
  | {
      type: "PING";
    }
  | {
      type: "CHECK_WORKDAY";
    }
  | {
      type: "WORKDAY_DETECTED";
      detected: boolean;
    }
  | {
      type: "GET_EXTENSION_STATE";
    }
  | {
      type: "SET_CANDIDATE_ID";
      candidateId: string;
    }
  | {
      type: "SCAN_WORKDAY_PAGE";
    }
  | {
      type: "RUN_DOM_SCAN";
    }
  | {
      type: "MAP_WORKDAY_FIELDS";
      candidateId: string;
    }
  | {
      type: "AUTOFILL_WORKDAY_FIELDS";
      candidateId: string;
    }
  | {
      type: "RUN_AUTOFILL";
      instructions: FillInstruction[];
    }
  | {
      type: "SCAN_DYNAMIC_SECTIONS";
    }
  | {
      type: "RUN_DYNAMIC_SCAN";
    }
  | {
      type: "ADD_REPEATABLE_ENTRY";
      kind: RepeatableSectionKind;
    }
  | {
      type: "RUN_ADD_REPEATABLE_ENTRY";
      kind: RepeatableSectionKind;
    }
  | {
      type: "AUTOFILL_REPEATABLE_SECTIONS";
      candidateId: string;
    }
  | {
      type: "RUN_REPEATABLE_AUTOFILL";
      candidate: CandidateProfile;
    }
  | {
      type: "SCAN_WORKDAY_NAVIGATION";
    }
  | {
      type: "RUN_NAVIGATION_SCAN";
    }
  | {
      type: "NAVIGATE_WORKDAY_CONTINUE";
    }
  | {
      type: "RUN_NAVIGATE_CONTINUE";
    }
  | {
      type: "NAVIGATE_WORKDAY_BACK";
    }
  | {
      type: "RUN_NAVIGATE_BACK";
    }
  | {
      type: "SCAN_WORKDAY_QUESTIONS";
    }
  | {
      type: "RUN_QUESTION_SCAN";
    }
  | {
      type: "VALIDATE_WORKDAY_STEP";
    }
  | {
      type: "RUN_VALIDATION_SCAN";
    }
  | {
      type: "SCAN_WORKDAY_REVIEW";
    }
  | {
      type: "RUN_REVIEW_SCAN";
    }
  | {
      type: "SUBMIT_WORKDAY_APPLICATION";
      explicitlyConfirmed: boolean;
    }
  | {
      type: "RUN_SUBMIT_WORKDAY_APPLICATION";
      explicitlyConfirmed: boolean;
    };

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ScanResponse =
  MessageResponse<WorkdayScanResult>;

export type MappingResponse =
  MessageResponse<FieldMappingResult>;

export type AutofillResponse =
  MessageResponse<AutofillResult>;

export type DynamicScanResponse =
  MessageResponse<DynamicSectionScanResult>;

export type AddRepeatableEntryResponse =
  MessageResponse<AddRepeatableEntryResult>;

export type RepeatableAutofillResponse =
  MessageResponse<RepeatableAutofillResult>;

export type NavigationStateResponse =
  MessageResponse<WorkdayNavigationState>;

export type NavigationActionResponse =
  MessageResponse<WorkdayNavigationResult>;

export type QuestionScanResponse =
  MessageResponse<QuestionScanResult>;

export type ValidationResponse =
  MessageResponse<WorkdayValidationResult>;

export type ReviewScanResponse =
  MessageResponse<WorkdayReviewResult>;

export type SubmitResponse =
  MessageResponse<WorkdaySubmitResult>;