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
  CandidateProfile,
} from "../types/candidate";

import type {
  FillInstruction,
} from "../types/fill";

import type {
  AddRepeatableEntryResponse,
  AutofillResponse,
  DynamicScanResponse,
  ExtensionMessage,
  MappingResponse,
  MessageResponse,
  RepeatableAutofillResponse,
  ScanResponse,
} from "../types/messages";

console.log(
  "Workday AI Assistant service worker loaded.",
);

chrome.runtime.onInstalled.addListener(
  () => {
    void resetExtensionState();

    console.log(
      "Workday AI Assistant installed or updated.",
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

const isWorkdayUrl = (
  url:
    | string
    | undefined,
): boolean => {
  if (!url) {
    return false;
  }

  return (
    url.includes(
      "myworkdayjobs.com",
    ) ||
    url.includes(
      "workday.com",
    )
  );
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
      !isWorkdayUrl(
        tab.url,
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
    candidateId:
      string,
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
          error instanceof
            Error
            ? error.message
            : "Unable to map Workday fields.",
      };
    }
  };

const autofillActiveTab =
  async (
    candidateId:
      string,
  ): Promise<AutofillResponse> => {
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
      !isWorkdayUrl(
        tab.url,
      )
    ) {
      return {
        success: false,

        error:
          "Open a Workday page before autofilling.",
      };
    }

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

    let mappingResult;

    try {
      mappingResult =
        await mapFields(
          candidateId,
          scan.data.fields,
        );
    } catch (error) {
      return {
        success: false,

        error:
          error instanceof
            Error
            ? error.message
            : "Unable to map Workday fields.",
      };
    }

    const fieldsById =
      new Map(
        scan.data.fields.map(
          (field) => [
            field.id,
            field,
          ],
        ),
      );

    const instructions:
      FillInstruction[] =
      mappingResult.mappings
        .filter((mapping) => {
          return (
            mapping.shouldFill &&
            Boolean(
              mapping.targetPath,
            ) &&
            Boolean(
              mapping.value,
            ) &&
            mapping.confidence >=
              0.9
          );
        })
        .flatMap(
          (mapping) => {
            const field =
              fieldsById.get(
                mapping.fieldId,
              );

            if (
              !field ||
              !mapping.targetPath ||
              !mapping.value
            ) {
              return [];
            }

            return [
              {
                fieldId:
                  mapping.fieldId,

                label:
                  mapping.label,

                kind:
                  mapping.kind,

                targetPath:
                  mapping.targetPath,

                value:
                  mapping.value,

                confidence:
                  mapping.confidence,

                selectorHint:
                  field.selectorHint,
              },
            ];
          },
        );

    if (
      instructions.length ===
      0
    ) {
      return {
        success: true,

        data: {
          attemptedCount: 0,

          filledCount: 0,

          skippedCount: 0,

          failedCount: 0,

          results: [],
        },
      };
    }

    try {
      return (
        await chrome.tabs.sendMessage(
          tab.id,
          {
            type:
              "RUN_AUTOFILL",

            instructions,
          },
        )
      ) as AutofillResponse;
    } catch (error) {
      console.error(
        "Unable to run Workday autofill:",
        error,
      );

      return {
        success: false,

        error:
          "Unable to run autofill on this Workday page.",
      };
    }
  };

const scanDynamicSections =
  async (): Promise<DynamicScanResponse> => {
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
      !isWorkdayUrl(
        tab.url,
      )
    ) {
      return {
        success: false,

        error:
          "Open a Workday page before detecting dynamic sections.",
      };
    }

    try {
      return (
        await chrome.tabs.sendMessage(
          tab.id,
          {
            type:
              "RUN_DYNAMIC_SCAN",
          },
        )
      ) as DynamicScanResponse;
    } catch (error) {
      console.error(
        "Unable to detect dynamic Workday sections:",
        error,
      );

      return {
        success: false,

        error:
          "Unable to detect dynamic Workday sections. Refresh the page and try again.",
      };
    }
  };

const addRepeatableEntryOnActiveTab =
  async (
    kind:
      Extract<
        ExtensionMessage,
        {
          type:
            "ADD_REPEATABLE_ENTRY";
        }
      >["kind"],
  ): Promise<AddRepeatableEntryResponse> => {
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
      !isWorkdayUrl(
        tab.url,
      )
    ) {
      return {
        success: false,

        error:
          "Open a Workday page before adding a repeatable section.",
      };
    }

    try {
      return (
        await chrome.tabs.sendMessage(
          tab.id,
          {
            type:
              "RUN_ADD_REPEATABLE_ENTRY",

            kind,
          },
        )
      ) as AddRepeatableEntryResponse;
    } catch (error) {
      console.error(
        "Unable to add repeatable Workday entry:",
        error,
      );

      return {
        success: false,

        error:
          "Unable to add the repeatable Workday entry.",
      };
    }
  };

const autofillRepeatableSectionsOnActiveTab =
  async (
    candidateId:
      string,
  ): Promise<RepeatableAutofillResponse> => {
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
      !isWorkdayUrl(
        tab.url,
      )
    ) {
      return {
        success: false,

        error:
          "Open a Workday My Experience page before autofilling Experience and Education.",
      };
    }

    try {
      const response =
        await fetch(
          `http://localhost:4000/api/candidates/${encodeURIComponent(
            candidateId,
          )}`,
        );

      const payload =
        (await response.json()) as {
          success: boolean;

          data?: CandidateProfile;

          error?: string;
        };

      if (
        !response.ok ||
        !payload.success ||
        !payload.data
      ) {
        return {
          success: false,

          error:
            payload.error ??
            "Unable to load candidate profile.",
        };
      }

      return (
        await chrome.tabs.sendMessage(
          tab.id,
          {
            type:
              "RUN_REPEATABLE_AUTOFILL",

            candidate:
              payload.data,
          },
        )
      ) as RepeatableAutofillResponse;
    } catch (error) {
      console.error(
        "Unable to autofill repeatable Workday sections:",
        error,
      );

      return {
        success: false,

        error:
          error instanceof
            Error
            ? error.message
            : "Unable to autofill Experience and Education.",
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

          data:
            state,
        });
      });

      return true;
    }

    if (
      message.type ===
      "SET_CANDIDATE_ID"
    ) {
      const candidateId =
        message.candidateId.trim();

      if (!candidateId) {
        sendResponse({
          success: false,

          error:
            "Candidate ID is required.",
        });

        return false;
      }

      void updateExtensionState({
        candidateId,
      }).then((state) => {
        console.log(
          "Candidate ID saved:",
          candidateId,
        );

        sendResponse({
          success: true,

          data:
            state,
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

        const current =
          await getExtensionState();

        const state =
          await updateExtensionState({
            ...current,

            backendConnected,
          });

        sendResponse({
          success: true,

          data:
            state,
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

    if (
      message.type ===
      "AUTOFILL_WORKDAY_FIELDS"
    ) {
      void autofillActiveTab(
        message.candidateId,
      ).then(
        sendResponse,
      );

      return true;
    }

    if (
      message.type ===
      "SCAN_DYNAMIC_SECTIONS"
    ) {
      void scanDynamicSections().then(
        sendResponse,
      );

      return true;
    }

    if (
      message.type ===
      "ADD_REPEATABLE_ENTRY"
    ) {
      void addRepeatableEntryOnActiveTab(
        message.kind,
      ).then(
        sendResponse,
      );

      return true;
    }

    if (
      message.type ===
      "AUTOFILL_REPEATABLE_SECTIONS"
    ) {
      void autofillRepeatableSectionsOnActiveTab(
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

          data:
            state,
        });
      },
    );

    return true;
  },
);