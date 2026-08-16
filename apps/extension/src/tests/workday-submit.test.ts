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
  "../review/workday-review",
  () => ({
    scanWorkdayReview:
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
  submitWorkdayApplication,
} from "../submission/workday-submit";

const mockedNavigation =
  vi.mocked(
    scanWorkdayNavigationState,
  );

const mockedReview =
  vi.mocked(
    scanWorkdayReview,
  );

describe(
  "submitWorkdayApplication",
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
      mockedReview.mockReset();
    });

    it(
      "never clicks Submit without explicit confirmation",
      async () => {
        document.body.innerHTML = `
          <button id="submit-button">
            Submit
          </button>
        `;

        const button =
          document.querySelector<HTMLButtonElement>(
            "#submit-button",
          );

        if (!button) {
          throw new Error(
            "Test submit button was not created.",
          );
        }

        const clickSpy =
          vi.spyOn(
            button,
            "click",
          );

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

        const result =
          await submitWorkdayApplication(
            false,
          );

        expect(
          result.submitted,
        ).toBe(false);

        expect(
          clickSpy,
        ).not.toHaveBeenCalled();

        expect(
          mockedReview,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "never clicks Submit when the current page is not Review",
      async () => {
        document.body.innerHTML = `
          <button id="submit-button">
            Submit
          </button>
        `;

        const button =
          document.querySelector<HTMLButtonElement>(
            "#submit-button",
          );

        if (!button) {
          throw new Error(
            "Test submit button was not created.",
          );
        }

        const clickSpy =
          vi.spyOn(
            button,
            "click",
          );

        mockedReview.mockReturnValue(
          {
            url:
              window.location.href,

            title:
              "Example Job",

            scannedAt:
              new Date().toISOString(),

            isReviewStep:
              false,

            applicationSubmitted:
              false,

            sectionCount:
              0,

            sections:
              [],

            submitDetected:
              false,

            readyForConfirmation:
              false,

            reason:
              "Current Workday step is not the Review page.",
          },
        );

        const result =
          await submitWorkdayApplication(
            true,
          );

        expect(
          result.submitted,
        ).toBe(false);

        expect(
          clickSpy,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "never clicks Submit when Review is not ready",
      async () => {
        document.body.innerHTML = `
          <button id="submit-button">
            Submit
          </button>
        `;

        const button =
          document.querySelector<HTMLButtonElement>(
            "#submit-button",
          );

        if (!button) {
          throw new Error(
            "Test submit button was not created.",
          );
        }

        const clickSpy =
          vi.spyOn(
            button,
            "click",
          );

        mockedReview.mockReturnValue(
          {
            url:
              window.location.href,

            title:
              "Example Job",

            scannedAt:
              new Date().toISOString(),

            isReviewStep:
              true,

            applicationSubmitted:
              false,

            sectionCount:
              1,

            sections:
              [],

            submitDetected:
              true,

            readyForConfirmation:
              false,

            reason:
              "Review page has 1 validation error(s).",
          },
        );

        const result =
          await submitWorkdayApplication(
            true,
          );

        expect(
          result.submitted,
        ).toBe(false);

        expect(
          clickSpy,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "clicks Submit exactly once after explicit confirmation on a valid Review page",
      async () => {
        document.body.innerHTML = `
          <button id="submit-button">
            Submit
          </button>
        `;

        const button =
          document.querySelector<HTMLButtonElement>(
            "#submit-button",
          );

        if (!button) {
          throw new Error(
            "Test submit button was not created.",
          );
        }

        const clickSpy =
          vi
            .spyOn(
              button,
              "click",
            )
            .mockImplementation(
              () => undefined,
            );

        mockedReview.mockReturnValue(
          {
            url:
              window.location.href,

            title:
              "Example Job",

            scannedAt:
              new Date().toISOString(),

            isReviewStep:
              true,

            applicationSubmitted:
              false,

            sectionCount:
              5,

            sections:
              [],

            submitDetected:
              true,

            readyForConfirmation:
              true,

            reason:
              "Review page is ready. Explicit user confirmation is required before submission.",
          },
        );

        const result =
          await submitWorkdayApplication(
            true,
          );

        expect(
          result.submitted,
        ).toBe(true);

        expect(
          clickSpy,
        ).toHaveBeenCalledTimes(
          1,
        );
      },
    );

    it(
      "recognizes an already completed Workday application without clicking anything",
      async () => {
        window.history.replaceState(
          {},
          "",
          "/jobTasks/completed/application",
        );

        document.body.innerHTML = `
          <main>
            <h1>
              Application Submitted
            </h1>

            <p>
              Your application has been successfully submitted.
            </p>
          </main>
        `;

        const result =
          await submitWorkdayApplication(
            true,
          );

        expect(
          result.submitted,
        ).toBe(true);

        expect(
          result.reviewStillDetected,
        ).toBe(false);

        expect(
          result.message,
        ).toContain(
          "successfully submitted",
        );

        expect(
          mockedReview,
        ).not.toHaveBeenCalled();
      },
    );
  },
);