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
  AddRepeatableEntryResult,
  DynamicSectionScanResult,
  RepeatableSectionKind,
} from "./repeatable";

import type {
  RepeatableAutofillResult,
} from "./repeatable-fill";

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