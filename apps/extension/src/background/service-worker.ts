import {
  checkBackendHealth,
  mapFields,
} from "../lib/api";

import {
  getExtensionState,
  resetExtensionState,
  updateExtensionState,
} from "../lib/storage";

import type {
  ExtensionMessage,
  MappingResponse,
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
      return (
        await chrome.tabs.sendMessage(
          tab.id,
          {
            type:
              "RUN_DOM_SCAN",
          },
        )
      ) as ScanResponse;
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

const mapActiveTab =
  async (
    candidateId: string,
  ): Promise<MappingResponse> => {
    const scan =
      await scanActiveTab();

    if (
      !scan.success ||
      !scan.data
    ) {
      return {
        success: false,
        error:
          scan.error ??
          "Unable to scan Workday fields.",
      };
    }

    try {
      const mappingResult =
        await mapFields(
          candidateId,
          scan.data.fields,
        );

      return {
        success: true,
        data:
          mappingResult,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to map Workday fields.",
      };
    }
  };

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
      "PING"
    ) {
      sendResponse({
        success: true,
        data: {
          message:
            "PONG",
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
      "SET_CANDIDATE_ID"
    ) {
      void updateExtensionState({
        candidateId:
          message.candidateId,
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
        sendResponse,
      );

      return true;
    }

    if (
      message.type ===
      "MAP_WORKDAY_FIELDS"
    ) {
      void mapActiveTab(
        message.candidateId,
      ).then(
        sendResponse,
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