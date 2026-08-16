import type { WorkdayScanResult } from "./dom-field";

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
      type: "SCAN_WORKDAY_PAGE";
    }
  | {
      type: "RUN_DOM_SCAN";
    };

export interface MessageResponse<T = unknown> {
  success: boolean;

  data?: T;

  error?: string;
}

export type ScanResponse =
  MessageResponse<WorkdayScanResult>;