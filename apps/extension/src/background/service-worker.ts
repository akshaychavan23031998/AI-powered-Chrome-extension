import {
  checkBackendHealth,
} from "../lib/api";

import {
  getExtensionState,
  resetExtensionState,
  updateExtensionState,
} from "../lib/storage";

import type {
  ExtensionMessage,
  MessageResponse,
  ScanResponse,
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

const getActiveTab =
  async (): Promise<
    chrome.tabs.Tab | undefined
  > => {
    const tabs =
      await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });

    return tabs[0];
  };

const scanActiveTab =
  async (): Promise<ScanResponse> => {
    const tab =
      await getActiveTab();

    if (!tab?.id) {
      return {
        success: false,
        error:
          "No active browser tab found.",
      };
    }

    if (
      !tab.url ||
      !(
        tab.url.includes(
          "myworkdayjobs.com",
        ) ||
        tab.url.includes(
          "workday.com",
        )
      )
    ) {
      return {
        success: false,
        error:
          "Open a Workday page before scanning.",
      };
    }

    try {
      const response =
        (await chrome.tabs.sendMessage(
          tab.id,
          {
            type: "RUN_DOM_SCAN",
          },
        )) as ScanResponse;

      return response;
    } catch (error) {
      console.error(
        "Unable to communicate with Workday content script:",
        error,
      );

      return {
        success: false,

        error:
          "Unable to scan this Workday page. Refresh the page and try again.",
      };
    }
  };

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender:
      chrome.runtime.MessageSender,
    sendResponse: (
      response: MessageResponse,
    ) => void,
  ) => {
    if (
      message.type === "PING"
    ) {
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

    if (
      message.type ===
      "SCAN_WORKDAY_PAGE"
    ) {
      void scanActiveTab().then(
        (result) => {
          sendResponse(
            result,
          );
        },
      );

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