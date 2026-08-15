import { checkBackendHealth } from "../lib/api";
import {
  getExtensionState,
  resetExtensionState,
  updateExtensionState,
} from "../lib/storage";

import type {
  ExtensionMessage,
  MessageResponse,
} from "../types/messages";

console.log(
  "Workday AI Assistant service worker loaded.",
);

chrome.runtime.onInstalled.addListener(
  () => {
    void resetExtensionState();

    console.log(
      "Workday AI Assistant installed.",
    );
  },
);

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (
      response: MessageResponse,
    ) => void,
  ) => {
    if (message.type === "PING") {
      sendResponse({
        success: true,
        data: {
          message: "PONG",
        },
      });

      return false;
    }

    if (
      message.type ===
      "WORKDAY_DETECTED"
    ) {
      void updateExtensionState({
        workdayDetected:
          message.detected,
      }).then((state) => {
        sendResponse({
          success: true,
          data: state,
        });
      });

      return true;
    }

    if (
      message.type ===
      "GET_EXTENSION_STATE"
    ) {
      void (async () => {
        const backendConnected =
          await checkBackendHealth();

        const state =
          await updateExtensionState({
            backendConnected,
          });

        sendResponse({
          success: true,
          data: state,
        });
      })();

      return true;
    }

    void getExtensionState().then(
      (state) => {
        sendResponse({
          success: true,
          data: state,
        });
      },
    );

    return true;
  },
);