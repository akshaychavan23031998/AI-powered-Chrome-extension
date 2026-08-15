import {
  DEFAULT_EXTENSION_STATE,
  type ExtensionState,
} from "../types/extension-state";

const EXTENSION_STATE_KEY =
  "workdayAiExtensionState";

export const getExtensionState =
  async (): Promise<ExtensionState> => {
    const result =
      await chrome.storage.local.get(
        EXTENSION_STATE_KEY,
      );

    return {
      ...DEFAULT_EXTENSION_STATE,

      ...(result[
        EXTENSION_STATE_KEY
      ] as Partial<ExtensionState> | undefined),
    };
  };

export const setExtensionState =
  async (
    state: ExtensionState,
  ): Promise<void> => {
    await chrome.storage.local.set({
      [EXTENSION_STATE_KEY]:
        state,
    });
  };

export const updateExtensionState =
  async (
    updates: Partial<ExtensionState>,
  ): Promise<ExtensionState> => {
    const currentState =
      await getExtensionState();

    const nextState: ExtensionState = {
      ...currentState,
      ...updates,
    };

    await setExtensionState(
      nextState,
    );

    return nextState;
  };

export const resetExtensionState =
  async (): Promise<void> => {
    await setExtensionState({
      ...DEFAULT_EXTENSION_STATE,
    });
  };