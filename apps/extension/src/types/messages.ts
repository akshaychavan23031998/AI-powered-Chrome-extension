import type {
  WorkdayScanResult,
} from "./dom-field";

import type {
  FieldMappingResult,
} from "./mapping";

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
    };

export interface MessageResponse<
  T = unknown,
> {
  success: boolean;

  data?: T;

  error?: string;
}

export type ScanResponse =
  MessageResponse<
    WorkdayScanResult
  >;

export type MappingResponse =
  MessageResponse<
    FieldMappingResult
  >;