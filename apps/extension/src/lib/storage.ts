import {
  DEFAULT_EXTENSION_STATE,
} from "../types/extension-state";

import type {
  ExtensionState,
} from "../types/extension-state";

const STORAGE_KEY =
  "workdayAiExtensionState";

const getStoredState =
  async (): Promise<
    Partial<ExtensionState>
  > => {
    const result =
      await chrome.storage.local.get(
        STORAGE_KEY,
      );

    const stored =
      result[
        STORAGE_KEY
      ];

    if (
      !stored ||
      typeof stored !==
        "object"
    ) {
      return {};
    }

    return stored as Partial<ExtensionState>;
  };

export const getExtensionState =
  async (): Promise<ExtensionState> => {
    const stored =
      await getStoredState();

    return {
      ...DEFAULT_EXTENSION_STATE,
      ...stored,
    };
  };

export const updateExtensionState =
  async (
    partial:
      Partial<ExtensionState>,
  ): Promise<ExtensionState> => {
    const current =
      await getExtensionState();

    const next:
      ExtensionState = {
        ...current,
        ...partial,
      };

    await chrome.storage.local.set({
      [STORAGE_KEY]:
        next,
    });

    return next;
  };

/**
 * Reset only temporary/runtime values.
 *
 * IMPORTANT:
 * Candidate ID is intentionally preserved.
 */
export const resetExtensionState =
  async (): Promise<ExtensionState> => {
    const current =
      await getExtensionState();

    const next:
      ExtensionState = {
        ...DEFAULT_EXTENSION_STATE,

        candidateId:
          current.candidateId,

        candidate:
          current.candidate,
      };

    await chrome.storage.local.set({
      [STORAGE_KEY]:
        next,
    });

    return next;
  };

/**
 * Explicitly remove the saved candidate.
 * We will use this later when we add
 * a "Change profile" / "Clear profile" UI.
 */
export const clearSavedCandidate =
  async (): Promise<ExtensionState> => {
    const current =
      await getExtensionState();

    const next:
      ExtensionState = {
        ...current,
        candidateId:
          undefined,
        candidate:
          undefined,
      };

    await chrome.storage.local.set({
      [STORAGE_KEY]:
        next,
    });

    return next;
  };