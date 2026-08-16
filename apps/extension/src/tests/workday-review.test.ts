import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock(
  "../navigator/workday-step-detector",
  () => ({
    scanWorkdayNavigationState:
      vi.fn(),
  }),
);

vi.mock(
  "../validation/workday-validator",
  () => ({
    validateWorkdayPage:
      vi.fn(),
  }),
);

import {
  scanWorkdayNavigationState,
} from "../navigator/workday-step-detector";

import {
  scanWorkdayReview,
} from "../review/workday-review";

import {
  validateWorkdayPage,
} from "../validation/workday-validator";

const mockedNavigation =
  vi.mocked(
    scanWorkdayNavigationState,
  );

const mockedValidation =
  vi.mocked(
    validateWorkdayPage,
  );

describe(
  "scanWorkdayReview",
  () => {
    beforeEach(() => {
      document.body.innerHTML =
        "";

      window.history.replaceState(
        {},
        "",
        "/apply",
      );

      mockedNavigation.mockReset();
      mockedValidation.mockReset();
    });

    it(
      "detects an already submitted Workday application",
      () => {
        window.history.replaceState(
          {},
          "",
          "/jobTasks/completed/application",
        );

        document.body.innerHTML = `
          <main>
            <h1>Application Submitted</h1>
            <p>Your application has been successfully submitted.</p>
          </main>
        `;

        const result =
          scanWorkdayReview();

        expect(
          result.applicationSubmitted,
        ).toBe(true);

        expect(
          result.isReviewStep,
        ).toBe(false);

        expect(
          result.submitDetected,
        ).toBe(false);

        expect(
          result.readyForConfirmation,
        ).toBe(false);

        expect(
          result.sectionCount,
        ).toBe(0);

        expect(
          mockedValidation,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "marks a valid Review page as ready for explicit confirmation",
      () => {
        mockedNavigation.mockReturnValue(
          {
            url:
              window.location.href,

            pageTitle:
              "Example Job",

            scannedAt:
              new Date().toISOString(),

            currentStep:
              "review",

            currentStepTitle:
              "Review",

            currentStepIndex:
              6,

            totalSteps:
              6,

            steps:
              [],

            canGoBack:
              true,

            canContinue:
              false,

            submitDetected:
              true,

            backButtonText:
              "Back",
          },
        );

        mockedValidation.mockReturnValue(
          {
            url:
              window.location.href,

            title:
              "Example Job",

            scannedAt:
              new Date().toISOString(),

            valid:
              true,

            errorCount:
              0,

            warningCount:
              0,

            issues:
              [],
          },
        );

        document.body.innerHTML = `
          <main>
            <h1>Review</h1>

            <section>
              <h2>My Information</h2>
              <p>Candidate information</p>
            </section>

            <section>
              <h2>My Experience</h2>
              <p>Candidate experience</p>
            </section>

            <button>
              Submit
            </button>
          </main>
        `;

        const result =
          scanWorkdayReview();

        expect(
          result.applicationSubmitted,
        ).toBe(false);

        expect(
          result.isReviewStep,
        ).toBe(true);

        expect(
          result.submitDetected,
        ).toBe(true);

        expect(
          result.readyForConfirmation,
        ).toBe(true);

        expect(
          result.reason,
        ).toContain(
          "Explicit user confirmation",
        );
      },
    );

    it(
      "does not mark a non-Review page as ready",
      () => {
        mockedNavigation.mockReturnValue(
          {
            url:
              window.location.href,

            pageTitle:
              "Example Job",

            scannedAt:
              new Date().toISOString(),

            currentStep:
              "selfIdentify",

            currentStepTitle:
              "Self Identify",

            currentStepIndex:
              5,

            totalSteps:
              6,

            steps:
              [],

            canGoBack:
              true,

            canContinue:
              true,

            submitDetected:
              false,

            continueButtonText:
              "Save & Continue",

            backButtonText:
              "Back",
          },
        );

        mockedValidation.mockReturnValue(
          {
            url:
              window.location.href,

            title:
              "Example Job",

            scannedAt:
              new Date().toISOString(),

            valid:
              true,

            errorCount:
              0,

            warningCount:
              0,

            issues:
              [],
          },
        );

        const result =
          scanWorkdayReview();

        expect(
          result.isReviewStep,
        ).toBe(false);

        expect(
          result.applicationSubmitted,
        ).toBe(false);

        expect(
          result.readyForConfirmation,
        ).toBe(false);

        expect(
          result.submitDetected,
        ).toBe(false);
      },
    );
  },
);