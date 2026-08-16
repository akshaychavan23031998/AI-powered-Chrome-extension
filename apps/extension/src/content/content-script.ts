import {
  runAutofill,
} from "../filler/autofill-engine";

import type {
  ExtensionMessage,
  MessageResponse,
} from "../types/messages";

import {
  isWorkdayPage,
} from "../workday/workday-detector";

import {
  scanWorkdayPage,
} from "../workday/workday-scanner";

const notifyWorkdayDetection =
  async (): Promise<void> => {
    const detected =
      isWorkdayPage();

    try {
      await chrome.runtime.sendMessage({
        type:
          "WORKDAY_DETECTED",

        detected,
      });
    } catch (error) {
      console.debug(
        "Unable to notify service worker:",
        error,
      );
    }
  };

console.log(
  "Workday AI Assistant content script loaded.",
);

void notifyWorkdayDetection();

chrome.runtime.onMessage.addListener(
  (
    message:
      ExtensionMessage,

    _sender:
      chrome.runtime.MessageSender,

    sendResponse: (
      response:
        MessageResponse,
    ) => void,
  ) => {
    if (
      message.type ===
      "CHECK_WORKDAY"
    ) {
      sendResponse({
        success: true,

        data: {
          detected:
            isWorkdayPage(),
        },
      });

      return false;
    }

    if (
      message.type ===
      "RUN_DOM_SCAN"
    ) {
      try {
        const result =
          scanWorkdayPage();

        console.log(
          "Workday DOM scan completed:",
          result,
        );

        sendResponse({
          success: true,
          data: result,
        });
      } catch (error) {
        console.error(
          "Workday DOM scan failed:",
          error,
        );

        sendResponse({
          success: false,

          error:
            error instanceof
              Error
              ? error.message
              : "Unknown DOM scanning error.",
        });
      }

      return false;
    }

    if (
      message.type ===
      "RUN_AUTOFILL"
    ) {
      void runAutofill(
        message.instructions,
      )
        .then((result) => {
          console.log(
            "Workday autofill completed:",
            result,
          );

          sendResponse({
            success: true,
            data: result,
          });
        })
        .catch((error) => {
          console.error(
            "Workday autofill failed:",
            error,
          );

          sendResponse({
            success: false,

            error:
              error instanceof
                Error
                ? error.message
                : "Unknown autofill error.",
          });
        });

      return true;
    }

    return false;
  },
);