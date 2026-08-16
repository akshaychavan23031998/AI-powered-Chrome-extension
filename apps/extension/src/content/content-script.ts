import {
  startDynamicPageObserver,
} from "../dynamic/dynamic-page-observer";

import {
  runAutofill,
} from "../filler/autofill-engine";

import {
  navigateWorkdayBack,
  navigateWorkdayContinue,
} from "../navigator/workday-navigator";

import {
  scanWorkdayNavigationState,
} from "../navigator/workday-step-detector";

import {
  scanQuestions,
} from "../questions/question-detector";

import {
  autofillRepeatableSections,
} from "../repeatable/repeatable-autofill-engine";

import {
  addRepeatableEntry,
} from "../repeatable/repeatable-section-manager";

import {
  scanRepeatableSections,
} from "../repeatable/repeatable-section-detector";

import type {
  ExtensionMessage,
  MessageResponse,
} from "../types/messages";

import {
  validateWorkdayPage,
} from "../validation/workday-validator";

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
        type: "WORKDAY_DETECTED",
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

startDynamicPageObserver();

void notifyWorkdayDetection();

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (
      response: MessageResponse,
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
        sendResponse({
          success: false,
          error:
            error instanceof Error
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
          sendResponse({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Unknown autofill error.",
          });
        });

      return true;
    }

    if (
      message.type ===
      "RUN_DYNAMIC_SCAN"
    ) {
      try {
        const result =
          scanRepeatableSections();

        console.log(
          "Workday dynamic section scan completed:",
          result,
        );

        sendResponse({
          success: true,
          data: result,
        });
      } catch (error) {
        sendResponse({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to scan dynamic Workday sections.",
        });
      }

      return false;
    }

    if (
      message.type ===
      "RUN_ADD_REPEATABLE_ENTRY"
    ) {
      void addRepeatableEntry(
        message.kind,
      )
        .then((result) => {
          console.log(
            "Repeatable Workday entry result:",
            result,
          );

          sendResponse({
            success: true,
            data: result,
          });
        })
        .catch((error) => {
          sendResponse({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to add repeatable Workday entry.",
          });
        });

      return true;
    }

    if (
      message.type ===
      "RUN_REPEATABLE_AUTOFILL"
    ) {
      console.log(
        "Starting Workday repeatable autofill.",
        {
          experienceCount:
            message.candidate
              .experience
              ?.length ?? 0,

          educationCount:
            message.candidate
              .education
              ?.length ?? 0,
        },
      );

      void autofillRepeatableSections(
        message.candidate,
      )
        .then((result) => {
          console.log(
            "Workday repeatable autofill completed:",
            result,
          );

          sendResponse({
            success: true,
            data: result,
          });
        })
        .catch((error) => {
          sendResponse({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to autofill repeatable Workday sections.",
          });
        });

      return true;
    }

    if (
      message.type ===
      "RUN_NAVIGATION_SCAN"
    ) {
      try {
        const result =
          scanWorkdayNavigationState();

        console.log(
          "Workday navigation scan completed:",
          result,
        );

        sendResponse({
          success: true,
          data: result,
        });
      } catch (error) {
        sendResponse({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to detect Workday navigation state.",
        });
      }

      return false;
    }

    if (
      message.type ===
      "RUN_NAVIGATE_CONTINUE"
    ) {
      void navigateWorkdayContinue()
        .then((result) => {
          console.log(
            "Workday continue navigation result:",
            result,
          );

          sendResponse({
            success: true,
            data: result,
          });
        })
        .catch((error) => {
          sendResponse({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to navigate to the next Workday step.",
          });
        });

      return true;
    }

    if (
      message.type ===
      "RUN_NAVIGATE_BACK"
    ) {
      void navigateWorkdayBack()
        .then((result) => {
          console.log(
            "Workday back navigation result:",
            result,
          );

          sendResponse({
            success: true,
            data: result,
          });
        })
        .catch((error) => {
          sendResponse({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to navigate to the previous Workday step.",
          });
        });

      return true;
    }

    if (
      message.type ===
      "RUN_QUESTION_SCAN"
    ) {
      try {
        const result =
          scanQuestions();

        console.log(
          "Workday question scan completed:",
          result,
        );

        sendResponse({
          success: true,
          data: result,
        });
      } catch (error) {
        sendResponse({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to scan Workday questions.",
        });
      }

      return false;
    }

    if (
      message.type ===
      "RUN_VALIDATION_SCAN"
    ) {
      try {
        const result =
          validateWorkdayPage();

        console.log(
          "Workday validation scan completed:",
          result,
        );

        sendResponse({
          success: true,
          data: result,
        });
      } catch (error) {
        sendResponse({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to validate the current Workday step.",
        });
      }

      return false;
    }

    return false;
  },
);