import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FillSummary,
} from "./components/FillSummary";

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
  AutofillResult,
} from "./types/fill";

import type {
  FieldMappingResult,
} from "./types/mapping";

import type {
  AutofillResponse,
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
    fillResult,
    setFillResult,
  ] =
    useState<
      AutofillResult | undefined
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
    filling,
    setFilling,
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
          caughtError instanceof
            Error
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

        setFillResult(
          undefined,
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

        setFillResult(
          undefined,
        );
      } catch (
        caughtError
      ) {
        setMappingResult(
          undefined,
        );

        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : "Unknown mapping error.",
        );
      } finally {
        setMapping(false);
      }
    };

  const autofillPage =
    async (): Promise<void> => {
      const id =
        candidateId.trim();

      if (!id) {
        setError(
          "Enter and save a candidate ID first.",
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Fill only safe high-confidence mapped fields on this Workday page? Existing values will not be overwritten.",
        );

      if (!confirmed) {
        return;
      }

      setFilling(true);
      setError(undefined);

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "AUTOFILL_WORKDAY_FIELDS",

            candidateId:
              id,
          })) as AutofillResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to autofill Workday fields.",
          );
        }

        setFillResult(
          response.data,
        );
      } catch (
        caughtError
      ) {
        setFillResult(
          undefined,
        );

        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : "Unknown autofill error.",
        );
      } finally {
        setFilling(false);
      }
    };

  useEffect(() => {
    void refreshState();
  }, [refreshState]);

  const busy =
    loading ||
    scanning ||
    mapping ||
    filling;

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
            disabled={busy}
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

      {fillResult && (
        <FillSummary
          result={
            fillResult
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
        disabled={busy}
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
          busy ||
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
          busy ||
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

      <button
        className="autofill-button"
        type="button"
        disabled={
          busy ||
          !extensionState.workdayDetected ||
          !candidateId.trim()
        }
        onClick={() => {
          void autofillPage();
        }}
      >
        {filling
          ? "Autofilling..."
          : "Autofill safe fields"}
      </button>

      <footer className="popup-footer">
        Phase 8 · Safe Autofill Engine
      </footer>
    </main>
  );
}

export default App;