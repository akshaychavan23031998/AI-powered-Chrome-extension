import {
  useCallback,
  useEffect,
  useState,
} from "react";

// import "./App.css";

import {
  ScanSummary,
} from "./components/ScanSummary";

import {
  StatusCard,
} from "./components/StatusCard";

import type {
  WorkdayScanResult,
} from "./types/dom-field";

import type {
  ExtensionState,
} from "./types/extension-state";

import type {
  MessageResponse,
  ScanResponse,
} from "./types/messages";

const initialState:
  ExtensionState = {
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

  const [
    scanResult,
    setScanResult,
  ] =
    useState<
      WorkdayScanResult | undefined
    >();

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    scanning,
    setScanning,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string>();

  const refreshState =
    useCallback(
      async (): Promise<void> => {
        setLoading(true);

        setError(undefined);

        try {
          const response =
            (await chrome.runtime.sendMessage({
              type:
                "GET_EXTENSION_STATE",
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
        } catch (
          caughtError
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : "Unknown extension error.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  const scanPage =
    async (): Promise<void> => {
      setScanning(true);

      setError(undefined);

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "SCAN_WORKDAY_PAGE",
          })) as ScanResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to scan Workday page.",
          );
        }

        setScanResult(
          response.data,
        );
      } catch (
        caughtError
      ) {
        setScanResult(
          undefined,
        );

        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : "Unknown scanning error.",
        );
      } finally {
        setScanning(false);
      }
    };

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

      {scanResult && (
        <ScanSummary
          result={
            scanResult
          }
        />
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button
        className="primary-button"
        type="button"
        disabled={
          loading ||
          scanning
        }
        onClick={() => {
          void refreshState();
        }}
      >
        {loading
          ? "Checking..."
          : "Refresh status"}
      </button>

      <button
        className="secondary-button"
        type="button"
        disabled={
          scanning ||
          !extensionState.workdayDetected
        }
        onClick={() => {
          void scanPage();
        }}
      >
        {scanning
          ? "Scanning..."
          : "Scan Workday page"}
      </button>

      <footer className="popup-footer">
        Phase 6 · Workday DOM Scanner
      </footer>
    </main>
  );
}

export default App;