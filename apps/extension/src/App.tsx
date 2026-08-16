import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  DynamicStatus,
} from "./components/DynamicStatus";

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
  AddRepeatableEntryResponse,
  AutofillResponse,
  DynamicScanResponse,
  MappingResponse,
  MessageResponse,
  NavigationActionResponse,
  NavigationStateResponse,
  QuestionScanResponse,
  RepeatableAutofillResponse,
  ReviewScanResponse,
  ScanResponse,
  SubmitResponse,
  ValidationResponse,
} from "./types/messages";

import type {
  WorkdayNavigationResult,
  WorkdayNavigationState,
} from "./types/navigation";

import type {
  QuestionScanResult,
} from "./types/question";

import type {
  DynamicSectionScanResult,
  RepeatableSectionKind,
} from "./types/repeatable";

import type {
  RepeatableAutofillResult,
} from "./types/repeatable-fill";

import type {
  WorkdayReviewResult,
  WorkdaySubmitResult,
} from "./types/review";

import type {
  WorkdayValidationResult,
} from "./types/validation";

const initialState: ExtensionState = {
  backendConnected: false,
  workdayDetected: false,
};

function App() {
  const [
    extensionState,
    setExtensionState,
  ] = useState<ExtensionState>(
    initialState,
  );

  const [
    candidateId,
    setCandidateId,
  ] = useState("");

  const [
    scanResult,
    setScanResult,
  ] = useState<
    WorkdayScanResult | undefined
  >();

  const [
    mappingResult,
    setMappingResult,
  ] = useState<
    FieldMappingResult | undefined
  >();

  const [
    fillResult,
    setFillResult,
  ] = useState<
    AutofillResult | undefined
  >();

  const [
    dynamicResult,
    setDynamicResult,
  ] = useState<
    DynamicSectionScanResult | undefined
  >();

  const [
    repeatableFillResult,
    setRepeatableFillResult,
  ] = useState<
    RepeatableAutofillResult | undefined
  >();

  const [
    navigationState,
    setNavigationState,
  ] = useState<
    WorkdayNavigationState | undefined
  >();

  const [
    navigationResult,
    setNavigationResult,
  ] = useState<
    WorkdayNavigationResult | undefined
  >();

  const [
    questionResult,
    setQuestionResult,
  ] = useState<
    QuestionScanResult | undefined
  >();

  const [
    validationResult,
    setValidationResult,
  ] = useState<
    WorkdayValidationResult | undefined
  >();

  const [
    reviewResult,
    setReviewResult,
  ] = useState<
    WorkdayReviewResult | undefined
  >();

  const [
    submitResult,
    setSubmitResult,
  ] = useState<
    WorkdaySubmitResult | undefined
  >();

  const [
    reviewAcknowledged,
    setReviewAcknowledged,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    scanning,
    setScanning,
  ] = useState(false);

  const [
    mapping,
    setMapping,
  ] = useState(false);

  const [
    filling,
    setFilling,
  ] = useState(false);

  const [
    scanningDynamic,
    setScanningDynamic,
  ] = useState(false);

  const [
    fillingRepeatable,
    setFillingRepeatable,
  ] = useState(false);

  const [
    scanningNavigation,
    setScanningNavigation,
  ] = useState(false);

  const [
    scanningQuestions,
    setScanningQuestions,
  ] = useState(false);

  const [
    validating,
    setValidating,
  ] = useState(false);

  const [
    navigating,
    setNavigating,
  ] = useState(false);

  const [
    scanningReview,
    setScanningReview,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    addingSection,
    setAddingSection,
  ] = useState<
    RepeatableSectionKind | undefined
  >();

  const [
    error,
    setError,
  ] = useState<string>();

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
            response.data.candidateId ??
              "",
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
        setError(
          response.error ??
            "Unable to save candidate ID.",
        );

        return;
      }

      setExtensionState(
        response.data,
      );

      setError(undefined);
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
      } catch (caughtError) {
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
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
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

      if (
        !window.confirm(
          "Fill safe high-confidence mapped fields? Existing values will not be overwritten.",
        )
      ) {
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
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unknown autofill error.",
        );
      } finally {
        setFilling(false);
      }
    };

  const scanDynamicSections =
    async (): Promise<void> => {
      setScanningDynamic(true);
      setError(undefined);

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "SCAN_DYNAMIC_SECTIONS",
          })) as DynamicScanResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to detect dynamic sections.",
          );
        }

        setDynamicResult(
          response.data,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to detect dynamic sections.",
        );
      } finally {
        setScanningDynamic(false);
      }
    };

  const addRepeatableSection =
    async (
      kind:
        RepeatableSectionKind,
    ): Promise<void> => {
      setAddingSection(
        kind,
      );

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "ADD_REPEATABLE_ENTRY",

            kind,
          })) as AddRepeatableEntryResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to add repeatable entry.",
          );
        }

        setDynamicResult(
          response.data.scan,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to add repeatable entry.",
        );
      } finally {
        setAddingSection(
          undefined,
        );
      }
    };

  const autofillRepeatable =
    async (): Promise<void> => {
      const id =
        candidateId.trim();

      if (!id) {
        setError(
          "Enter and save a candidate ID first.",
        );

        return;
      }

      if (
        !window.confirm(
          "Create missing Experience/Education entries and fill supported fields? Save and Continue will NOT be clicked.",
        )
      ) {
        return;
      }

      setFillingRepeatable(
        true,
      );

      setError(undefined);

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "AUTOFILL_REPEATABLE_SECTIONS",

            candidateId:
              id,
          })) as RepeatableAutofillResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to autofill Experience and Education.",
          );
        }

        setRepeatableFillResult(
          response.data,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unknown repeatable autofill error.",
        );
      } finally {
        setFillingRepeatable(
          false,
        );
      }
    };

  const scanNavigation =
    async (): Promise<void> => {
      setScanningNavigation(
        true,
      );

      setError(undefined);

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "SCAN_WORKDAY_NAVIGATION",
          })) as NavigationStateResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to detect Workday navigation.",
          );
        }

        setNavigationState(
          response.data,
        );

        setNavigationResult(
          undefined,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to detect Workday navigation.",
        );
      } finally {
        setScanningNavigation(
          false,
        );
      }
    };

  const scanWorkdayQuestions =
    async (): Promise<void> => {
      setScanningQuestions(
        true,
      );

      setError(undefined);

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "SCAN_WORKDAY_QUESTIONS",
          })) as QuestionScanResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to scan Workday questions.",
          );
        }

        setQuestionResult(
          response.data,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to scan Workday questions.",
        );
      } finally {
        setScanningQuestions(
          false,
        );
      }
    };

  const validateCurrentStep =
    async (): Promise<void> => {
      setValidating(
        true,
      );

      setError(undefined);

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "VALIDATE_WORKDAY_STEP",
          })) as ValidationResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to validate the current Workday step.",
          );
        }

        setValidationResult(
          response.data,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to validate Workday step.",
        );
      } finally {
        setValidating(
          false,
        );
      }
    };

  const navigateContinue =
    async (): Promise<void> => {
      if (
        navigationState
          ?.submitDetected
      ) {
        setError(
          "Submit detected. Automatic submission is blocked.",
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Validate this Workday step, save it, and continue to the next step?",
        );

      if (
        !confirmed
      ) {
        return;
      }

      setNavigating(
        true,
      );

      setError(undefined);

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "NAVIGATE_WORKDAY_CONTINUE",
          })) as NavigationActionResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to continue.",
          );
        }

        setNavigationResult(
          response.data,
        );

        setNavigationState(
          response.data.state,
        );

        if (
          !response.data.navigated
        ) {
          setError(
            response.data.reason,
          );

          await validateCurrentStep();
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to continue.",
        );
      } finally {
        setNavigating(
          false,
        );
      }
    };

  const navigateBack =
    async (): Promise<void> => {
      setNavigating(
        true,
      );

      setError(undefined);

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "NAVIGATE_WORKDAY_BACK",
          })) as NavigationActionResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to navigate back.",
          );
        }

        setNavigationResult(
          response.data,
        );

        setNavigationState(
          response.data.state,
        );

        setReviewResult(
          undefined,
        );

        setReviewAcknowledged(
          false,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to navigate back.",
        );
      } finally {
        setNavigating(
          false,
        );
      }
    };

  const scanFinalReview =
    async (): Promise<void> => {
      setScanningReview(
        true,
      );

      setError(undefined);

      setSubmitResult(
        undefined,
      );

      setReviewAcknowledged(
        false,
      );

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "SCAN_WORKDAY_REVIEW",
          })) as ReviewScanResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to scan the final Workday Review page.",
          );
        }

        setReviewResult(
          response.data,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to scan final review.",
        );
      } finally {
        setScanningReview(
          false,
        );
      }
    };

  const submitApplication =
    async (): Promise<void> => {
      if (
        !reviewResult
          ?.readyForConfirmation
      ) {
        setError(
          "Final Review is not ready for submission.",
        );

        return;
      }

      if (
        !reviewAcknowledged
      ) {
        setError(
          "Confirm that you reviewed the application before submitting.",
        );

        return;
      }

      const confirmed =
        window.confirm(
          "FINAL CONFIRMATION\n\nThis will submit the application to Workday.\n\nSubmit this application now?",
        );

      if (
        !confirmed
      ) {
        return;
      }

      setSubmitting(
        true,
      );

      setError(undefined);

      try {
        const response =
          (await chrome.runtime.sendMessage({
            type:
              "SUBMIT_WORKDAY_APPLICATION",

            explicitlyConfirmed:
              true,
          })) as SubmitResponse;

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.error ??
              "Unable to submit the Workday application.",
          );
        }

        setSubmitResult(
          response.data,
        );

        if (
          !response.data.submitted
        ) {
          setError(
            response.data.message,
          );
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to submit Workday application.",
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    };

  /*
   * Initial popup state load.
   *
   * Keep this separate from refreshState().
   * React's set-state-in-effect lint rule does not want us
   * synchronously invoking another state-updating callback
   * directly from the effect body.
   *
   * The Chrome message is asynchronous, so state updates occur
   * after the external system responds.
   */
  useEffect(() => {
    let cancelled =
      false;

    const loadInitialState =
      async (): Promise<void> => {
        try {
          const response =
            (await chrome.runtime.sendMessage({
              type:
                "GET_EXTENSION_STATE",
            })) as MessageResponse<ExtensionState>;

          if (
            cancelled
          ) {
            return;
          }

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
            response.data.candidateId ??
              "",
          );
        } catch (caughtError) {
          if (
            cancelled
          ) {
            return;
          }

          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unknown extension error.",
          );
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false,
            );
          }
        }
      };

    void loadInitialState();

    return () => {
      cancelled =
        true;
    };
  }, []);

  const busy =
    loading ||
    scanning ||
    mapping ||
    filling ||
    scanningDynamic ||
    fillingRepeatable ||
    scanningNavigation ||
    scanningQuestions ||
    validating ||
    navigating ||
    scanningReview ||
    submitting ||
    Boolean(
      addingSection,
    );

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
          Resume-aware Workday application automation.
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
          className="status-label"
          htmlFor="candidateId"
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
            ) =>
              setCandidateId(
                event.target.value,
              )
            }
            placeholder="MongoDB candidate ID"
          />

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void saveCandidateId()
            }
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

      {dynamicResult && (
        <>
          <DynamicStatus
            result={
              dynamicResult
            }
          />

          <section className="repeatable-actions">
            {dynamicResult.sections.map(
              (section) => (
                <button
                  key={
                    section.kind
                  }
                  type="button"
                  className="repeatable-button"
                  disabled={
                    busy ||
                    !section.canAddAnother
                  }
                  onClick={() =>
                    void addRepeatableSection(
                      section.kind,
                    )
                  }
                >
                  Add{" "}
                  {
                    section.title
                  }
                </button>
              ),
            )}
          </section>
        </>
      )}

      {repeatableFillResult && (
        <section className="fill-summary">
          <p className="status-label">
            Experience & Education Autofill
          </p>

          <p className="scan-title">
            {
              repeatableFillResult.filledCount
            }{" "}
            fields filled
          </p>

          <div className="scan-stats">
            <div>
              <strong>
                {
                  repeatableFillResult.filledCount
                }
              </strong>

              <span>
                Filled
              </span>
            </div>

            <div>
              <strong>
                {
                  repeatableFillResult.skippedCount
                }
              </strong>

              <span>
                Skipped
              </span>
            </div>

            <div>
              <strong>
                {
                  repeatableFillResult.failedCount
                }
              </strong>

              <span>
                Failed
              </span>
            </div>
          </div>
        </section>
      )}

      {navigationState && (
        <section className="fill-summary">
          <p className="status-label">
            Workday Navigation
          </p>

          <p className="scan-title">
            {
              navigationState.currentStepTitle
            }
          </p>

          {navigationState.currentStepIndex &&
            navigationState.totalSteps && (
              <p className="mapping-empty">
                Step{" "}
                {
                  navigationState.currentStepIndex
                }{" "}
                of{" "}
                {
                  navigationState.totalSteps
                }
              </p>
            )}

          <div className="scan-stats">
            <div>
              <strong>
                {navigationState.canGoBack
                  ? "Yes"
                  : "No"}
              </strong>

              <span>
                Back
              </span>
            </div>

            <div>
              <strong>
                {navigationState.canContinue
                  ? "Yes"
                  : "No"}
              </strong>

              <span>
                Continue
              </span>
            </div>

            <div>
              <strong>
                {navigationState.submitDetected
                  ? "YES"
                  : "No"}
              </strong>

              <span>
                Submit
              </span>
            </div>
          </div>

          {navigationState.submitDetected && (
            <p className="error-message">
              Submit detected. Automatic submission is blocked.
            </p>
          )}

          {navigationResult && (
            <p className="mapping-empty">
              {
                navigationResult.reason
              }
            </p>
          )}

          <button
            type="button"
            className="secondary-button"
            disabled={
              busy ||
              !navigationState.canGoBack
            }
            onClick={() =>
              void navigateBack()
            }
          >
            Back
          </button>

          <button
            type="button"
            className="repeatable-button"
            disabled={
              busy ||
              !navigationState.canContinue ||
              navigationState.submitDetected
            }
            onClick={() =>
              void navigateContinue()
            }
          >
            Save & Continue
          </button>
        </section>
      )}

      {questionResult && (
        <section className="fill-summary">
          <p className="status-label">
            Workday Questions
          </p>

          <p className="scan-title">
            {
              questionResult.questionCount
            }{" "}
            questions detected
          </p>

          <div className="scan-stats">
            <div>
              <strong>
                {
                  questionResult.normalCount
                }
              </strong>

              <span>
                Normal
              </span>
            </div>

            <div>
              <strong>
                {
                  questionResult.sensitiveCount
                }
              </strong>

              <span>
                Sensitive
              </span>
            </div>

            <div>
              <strong>
                {
                  questionResult.unansweredCount
                }
              </strong>

              <span>
                Unanswered
              </span>
            </div>
          </div>

          {questionResult.questions.map(
            (
              question,
              index,
            ) => (
              <div
                key={`${question.id}-${index}`}
                className="mapping-empty"
              >
                <strong>
                  {question.sensitivity ===
                  "sensitive"
                    ? "⚠ Sensitive"
                    : "Question"}
                </strong>

                <div>
                  {
                    question.label
                  }
                </div>

                <div>
                  Type:{" "}
                  {
                    question.controlKind
                  }
                  {" · "}
                  Category:{" "}
                  {
                    question.category
                  }
                </div>

                <div>
                  {question.required
                    ? "Required"
                    : "Optional"}
                  {" · "}
                  {question.answered
                    ? "Answered"
                    : "Unanswered"}
                </div>
              </div>
            ),
          )}
        </section>
      )}

      {validationResult && (
        <section className="fill-summary">
          <p className="status-label">
            Step Validation
          </p>

          <p className="scan-title">
            {validationResult.valid
              ? "Current step looks valid"
              : `${validationResult.errorCount} validation error(s) detected`}
          </p>

          <div className="scan-stats">
            <div>
              <strong>
                {validationResult.valid
                  ? "YES"
                  : "NO"}
              </strong>

              <span>
                Valid
              </span>
            </div>

            <div>
              <strong>
                {
                  validationResult.errorCount
                }
              </strong>

              <span>
                Errors
              </span>
            </div>

            <div>
              <strong>
                {
                  validationResult.warningCount
                }
              </strong>

              <span>
                Warnings
              </span>
            </div>
          </div>

          {validationResult.issues.map(
            (
              issue,
              index,
            ) => (
              <div
                key={`${issue.id}-${index}`}
                className="mapping-empty"
              >
                <strong>
                  {issue.severity ===
                  "error"
                    ? "Validation Error"
                    : "Warning"}
                </strong>

                {issue.label && (
                  <div>
                    {
                      issue.label
                    }
                  </div>
                )}

                <div>
                  {
                    issue.message
                  }
                </div>

                <div>
                  Type:{" "}
                  {
                    issue.type
                  }
                </div>
              </div>
            ),
          )}
        </section>
      )}

      {reviewResult && (
        <section className="fill-summary">
          <p className="status-label">
            {reviewResult.applicationSubmitted
              ? "Submission Status"
              : "Final Review"}
          </p>

          <p className="scan-title">
            {reviewResult.applicationSubmitted
              ? "Application Submitted"
              : reviewResult.readyForConfirmation
                ? "Ready for explicit confirmation"
                : "Not ready for submission"}
          </p>

          {reviewResult.applicationSubmitted ? (
            <>
              <div className="scan-stats">
                <div>
                  <strong>
                    YES
                  </strong>

                  <span>
                    Completed
                  </span>
                </div>

                <div>
                  <strong>
                    NO
                  </strong>

                  <span>
                    Review
                  </span>
                </div>

                <div>
                  <strong>
                    NO
                  </strong>

                  <span>
                    Submit
                  </span>
                </div>
              </div>

              <p className="mapping-empty">
                {
                  reviewResult.reason
                }
              </p>
            </>
          ) : (
            <>
              <div className="scan-stats">
                <div>
                  <strong>
                    {reviewResult.isReviewStep
                      ? "YES"
                      : "NO"}
                  </strong>

                  <span>
                    Review
                  </span>
                </div>

                <div>
                  <strong>
                    {
                      reviewResult.sectionCount
                    }
                  </strong>

                  <span>
                    Sections
                  </span>
                </div>

                <div>
                  <strong>
                    {reviewResult.submitDetected
                      ? "YES"
                      : "NO"}
                  </strong>

                  <span>
                    Submit
                  </span>
                </div>
              </div>

              <p className="mapping-empty">
                {
                  reviewResult.reason
                }
              </p>

              {reviewResult.sections.map(
                (section) => (
                  <div
                    key={
                      section.id
                    }
                    className="mapping-empty"
                  >
                    <strong>
                      {
                        section.title
                      }
                    </strong>

                    <div>
                      {
                        section.text.length >
                        350
                          ? `${section.text.slice(
                              0,
                              350,
                            )}...`
                          : section.text
                      }
                    </div>
                  </div>
                ),
              )}

              {reviewResult.readyForConfirmation && (
                <>
                  <label
                    className="mapping-empty"
                    style={{
                      display:
                        "flex",

                      gap:
                        "8px",

                      alignItems:
                        "flex-start",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        reviewAcknowledged
                      }
                      onChange={(
                        event,
                      ) =>
                        setReviewAcknowledged(
                          event.target.checked,
                        )
                      }
                    />

                    <span>
                      I have reviewed the application and want to enable final submission.
                    </span>
                  </label>

                  <button
                    type="button"
                    className="autofill-button"
                    disabled={
                      busy ||
                      !reviewAcknowledged
                    }
                    onClick={() =>
                      void submitApplication()
                    }
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Application"}
                  </button>
                </>
              )}
            </>
          )}
        </section>
      )}

      {submitResult && (
        <section className="fill-summary">
          <p className="status-label">
            Submission Result
          </p>

          <p className="scan-title">
            {submitResult.submitted
              ? "Submission action completed"
              : "Submission not confirmed"}
          </p>

          <p className="mapping-empty">
            {
              submitResult.message
            }
          </p>
        </section>
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
        onClick={() =>
          void refreshState()
        }
      >
        Refresh status
      </button>

      <button
        className="secondary-button"
        type="button"
        disabled={
          busy ||
          !extensionState.workdayDetected
        }
        onClick={() =>
          void scanPage()
        }
      >
        Scan Workday page
      </button>

      <button
        className="secondary-button"
        type="button"
        disabled={
          busy ||
          !candidateId.trim()
        }
        onClick={() =>
          void mapPage()
        }
      >
        Map fields to candidate
      </button>

      <button
        className="autofill-button"
        type="button"
        disabled={
          busy ||
          !candidateId.trim()
        }
        onClick={() =>
          void autofillPage()
        }
      >
        Autofill safe fields
      </button>

      <button
        className="dynamic-scan-button"
        type="button"
        disabled={busy}
        onClick={() =>
          void scanDynamicSections()
        }
      >
        Detect dynamic sections
      </button>

      <button
        className="repeatable-button"
        type="button"
        disabled={
          busy ||
          !candidateId.trim()
        }
        onClick={() =>
          void autofillRepeatable()
        }
      >
        Autofill Experience & Education
      </button>

      <button
        className="secondary-button"
        type="button"
        disabled={busy}
        onClick={() =>
          void scanNavigation()
        }
      >
        {scanningNavigation
          ? "Detecting navigation..."
          : "Detect navigation"}
      </button>

      <button
        className="secondary-button"
        type="button"
        disabled={
          busy ||
          !extensionState.workdayDetected
        }
        onClick={() =>
          void scanWorkdayQuestions()
        }
      >
        {scanningQuestions
          ? "Detecting questions..."
          : "Detect Questions"}
      </button>

      <button
        className="secondary-button"
        type="button"
        disabled={
          busy ||
          !extensionState.workdayDetected
        }
        onClick={() =>
          void validateCurrentStep()
        }
      >
        {validating
          ? "Validating..."
          : "Validate Current Step"}
      </button>

      <button
        className="primary-button"
        type="button"
        disabled={
          busy ||
          !extensionState.workdayDetected
        }
        onClick={() =>
          void scanFinalReview()
        }
      >
        {scanningReview
          ? "Scanning Final Review..."
          : "Scan Final Review"}
      </button>

      <footer className="popup-footer">
        Phase 14 · Testing & Safety Hardening
      </footer>
    </main>
  );
}

export default App;