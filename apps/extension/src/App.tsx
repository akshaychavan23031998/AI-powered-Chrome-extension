import {
  useCallback,
  useEffect,
  useState,
} from "react";

import "./App.css";

import { StatusCard } from "./components/StatusCard";

import type { ExtensionState } from "./types/extension-state";

import type { MessageResponse } from "./types/messages";

const initialState: ExtensionState = {
  backendConnected: false,
  workdayDetected: false,
};

function App() {
  const [
    extensionState,
    setExtensionState,
  ] =
    useState<ExtensionState>(
      initialState,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string>();

  const refreshState =
    useCallback(
      async (): Promise<void> => {
        setLoading(true);
        setError(undefined);

        try {
          const response =
            (await chrome.runtime.sendMessage({
              type: "GET_EXTENSION_STATE",
            })) as MessageResponse<ExtensionState>;

          if (
            !response.success ||
            !response.data
          ) {
            throw new Error(
              response.error ??
                "Unable to read extension state.",
            );
          }

          setExtensionState(
            response.data,
          );
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unknown extension error.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void refreshState();
  }, [refreshState]);

  return (
    <main className="popup">
      <header className="popup-header">
        <div>
          <p className="eyebrow">
            WORKDAY AI
          </p>

          <h1>
            Application Assistant
          </h1>

          <p className="subtitle">
            Resume-aware Workday
            application automation.
          </p>
        </div>
      </header>

      <section className="status-section">
        <StatusCard
          label="Backend"
          connected={
            extensionState.backendConnected
          }
          connectedText="Connected"
          disconnectedText="Disconnected"
        />

        <StatusCard
          label="Workday page"
          connected={
            extensionState.workdayDetected
          }
          connectedText="Detected"
          disconnectedText="Not detected"
        />
      </section>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button
        className="primary-button"
        type="button"
        disabled={loading}
        onClick={() => {
          void refreshState();
        }}
      >
        {loading
          ? "Checking..."
          : "Refresh status"}
      </button>

      <footer className="popup-footer">
        Phase 5 · Extension Foundation
      </footer>
    </main>
  );
}

export default App;