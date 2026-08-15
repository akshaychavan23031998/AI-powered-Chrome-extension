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
    };

export interface MessageResponse<T = unknown> {
  success: boolean;

  data?: T;

  error?: string;
}