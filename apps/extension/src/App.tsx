import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  MappingSummary,
} from "./components/MappingSummary";

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
  FieldMappingResult,
} from "./types/mapping";

import type {
  MappingResponse,
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
    candidateId,
    setCandidateId,
  ] =
    useState("");

  const [
    scanResult,
    setScanResult,
  ] =
    useState<
      WorkdayScanResult | undefined
    >();

  const [
    mappingResult,
    setMappingResult,
  ] =
    useState<
      FieldMappingResult | undefined
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
    mapping,
    setMapping,
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

          setCandidateId(
            response.data
              .candidateId ??
              "",
          );
        } catch (
          caughtError
        ) {
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

  const saveCandidateId =
    async (): Promise<void> => {
      const normalized =
        candidateId.trim();

      if (!normalized) {
        setError(
          "Candidate ID is required.",
        );

        return;
      }

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "SET_CANDIDATE_ID",

            candidateId:
              normalized,
          })) as MessageResponse<ExtensionState>;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to save candidate ID.",
          );
        }

        setExtensionState(
          response.data,
        );

        setError(undefined);
      } catch (
        caughtError
      ) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to save candidate ID.",
        );
      }
    };

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

        setMappingResult(
          undefined,
        );
      } catch (
        caughtError
      ) {
        setScanResult(
          undefined,
        );

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unknown scanning error.",
        );
      } finally {
        setScanning(false);
      }
    };

  const mapPage =
    async (): Promise<void> => {
      const id =
        candidateId.trim();

      if (!id) {
        setError(
          "Enter and save a candidate ID first.",
        );

        return;
      }

      setMapping(true);
      setError(undefined);

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "MAP_WORKDAY_FIELDS",

            candidateId:
              id,
          })) as MappingResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to map Workday fields.",
          );
        }

        setMappingResult(
          response.data,
        );
      } catch (
        caughtError
      ) {
        setMappingResult(
          undefined,
        );

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unknown mapping error.",
        );
      } finally {
        setMapping(false);
      }
    };

  useEffect(() => {
    void refreshState();
  }, [refreshState]);

  return (
    <main className="popup">
      <header className="popup-header">
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

      <section className="candidate-section">
        <label
          htmlFor="candidateId"
          className="status-label"
        >
          Candidate ID
        </label>

        <div className="candidate-input-row">
          <input
            id="candidateId"
            value={
              candidateId
            }
            onChange={(
              event,
            ) => {
              setCandidateId(
                event.target.value,
              );
            }}
            placeholder="MongoDB candidate ID"
          />

          <button
            type="button"
            onClick={() => {
              void saveCandidateId();
            }}
          >
            Save
          </button>
        </div>
      </section>

      {scanResult && (
        <ScanSummary
          result={
            scanResult
          }
        />
      )}

      {mappingResult && (
        <MappingSummary
          result={
            mappingResult
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
          scanning ||
          mapping
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

      <button
        className="secondary-button"
        type="button"
        disabled={
          mapping ||
          !extensionState.workdayDetected ||
          !candidateId.trim()
        }
        onClick={() => {
          void mapPage();
        }}
      >
        {mapping
          ? "Mapping..."
          : "Map fields to candidate"}
      </button>

      <footer className="popup-footer">
        Phase 7 · Semantic Field Mapping
      </footer>
    </main>
  );
}

export default App;