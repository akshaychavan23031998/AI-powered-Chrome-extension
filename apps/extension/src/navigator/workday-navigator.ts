import {
  waitForCondition,
  waitForDomMutation,
} from "../dynamic/mutation-waiter";

import type {
  WorkdayNavigationResult,
  WorkdayNavigationState,
} from "../types/navigation";

import {
  scanWorkdayNavigationState,
} from "./workday-step-detector";

const cleanText = (
  value:
    | string
    | null
    | undefined,
): string => {
  return (
    value
      ?.replace(/\s+/g, " ")
      .trim() ?? ""
  );
};

const normalize = (
  value: string,
): string => {
  return cleanText(
    value,
  ).toLowerCase();
};

const sleep = (
  milliseconds: number,
): Promise<void> => {
  return new Promise(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
};

const isVisible = (
  element: HTMLElement,
): boolean => {
  const style =
    window.getComputedStyle(
      element,
    );

  if (
    style.display === "none" ||
    style.visibility === "hidden"
  ) {
    return false;
  }

  const rect =
    element.getBoundingClientRect();

  return (
    rect.width > 0 &&
    rect.height > 0
  );
};

const findButton = (
  patterns: string[],
): HTMLElement | undefined => {
  const candidates =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        [
          "button",
          "[role='button']",
        ].join(","),
      ),
    ).filter(
      isVisible,
    );

  return candidates.find(
    (candidate) => {
      const text =
        normalize(
          candidate.getAttribute(
            "aria-label",
          ) ??
            candidate.textContent ??
            "",
        );

      return patterns.some(
        (pattern) => {
          const target =
            normalize(
              pattern,
            );

          return (
            text === target ||
            text.includes(
              target,
            )
          );
        },
      );
    },
  );
};

const buildFailureResult = (
  action:
    | "back"
    | "continue",

  previous:
    WorkdayNavigationState,

  reason: string,
): WorkdayNavigationResult => {
  return {
    action,

    navigated: false,

    previousStep:
      previous.currentStep,

    currentStep:
      previous.currentStep,

    reason,

    state:
      previous,
  };
};

const waitForStableNavigationState =
  async (
    previous:
      WorkdayNavigationState,

    oldUrl: string,
  ): Promise<WorkdayNavigationState> => {
    /*
     * Workday is a React application.
     *
     * The first DOM mutation does not necessarily mean
     * that the next application step has finished rendering.
     *
     * Wait until:
     *
     * 1. URL changes, OR
     * 2. detected step changes,
     *
     * and then additionally wait until the detector no
     * longer reports "unknown".
     */
    await waitForCondition(
      () => {
        const state =
          scanWorkdayNavigationState();

        return (
          window.location.href !==
            oldUrl ||
          (
            state.currentStep !==
              previous.currentStep &&
            state.currentStep !==
              "unknown"
          )
        );
      },
      10000,
      200,
    );

    await waitForCondition(
      () => {
        const state =
          scanWorkdayNavigationState();

        return (
          state.currentStep !==
          "unknown"
        );
      },
      6000,
      200,
    );

    /*
     * Small settle delay so Workday can finish
     * rendering buttons/progress indicators.
     */
    await sleep(
      250,
    );

    return scanWorkdayNavigationState();
  };

export const navigateWorkdayContinue =
  async (): Promise<WorkdayNavigationResult> => {
    const previous =
      scanWorkdayNavigationState();

    /*
     * Submit is intentionally blocked here.
     *
     * Final submission must always remain a separate,
     * explicit user-confirmed action.
     */
    if (
      previous.submitDetected
    ) {
      return buildFailureResult(
        "continue",

        previous,

        "Submit button detected. Automatic submit is blocked.",
      );
    }

    const button =
      findButton([
        "save and continue",
        "continue",
        "next",
      ]);

    if (!button) {
      return buildFailureResult(
        "continue",

        previous,

        "Save and Continue button was not found.",
      );
    }

    if (
      button.getAttribute(
        "aria-disabled",
      ) === "true" ||
      (
        button instanceof
          HTMLButtonElement &&
        button.disabled
      )
    ) {
      return buildFailureResult(
        "continue",

        previous,

        "Save and Continue is currently disabled.",
      );
    }

    const oldUrl =
      window.location.href;

    const mutationPromise =
      waitForDomMutation({
        timeoutMs:
          8000,
      });

    button.scrollIntoView({
      block: "center",
    });

    button.click();

    await mutationPromise;

    const pageChanged =
      await waitForCondition(
        () => {
          const state =
            scanWorkdayNavigationState();

          return (
            window.location.href !==
              oldUrl ||
            state.currentStep !==
              previous.currentStep
          );
        },
        10000,
        200,
      );

    if (!pageChanged) {
      const current =
        scanWorkdayNavigationState();

      return {
        action:
          "continue",

        navigated:
          false,

        previousStep:
          previous.currentStep,

        currentStep:
          current.currentStep,

        reason:
          "Workday did not confirm navigation. Validation errors may be blocking the page.",

        state:
          current,
      };
    }

    const current =
      await waitForStableNavigationState(
        previous,
        oldUrl,
      );

    const successfullyChanged =
      current.currentStep !==
        previous.currentStep &&
      current.currentStep !==
        "unknown";

    return {
      action:
        "continue",

      navigated:
        successfullyChanged,

      previousStep:
        previous.currentStep,

      currentStep:
        current.currentStep,

      reason:
        successfullyChanged
          ? `Navigated from ${previous.currentStepTitle} to ${current.currentStepTitle} successfully.`
          : "Workday navigation occurred, but the next step could not be identified reliably.",

      state:
        current,
    };
  };

export const navigateWorkdayBack =
  async (): Promise<WorkdayNavigationResult> => {
    const previous =
      scanWorkdayNavigationState();

    const button =
      findButton([
        "back",
        "previous",
      ]);

    if (!button) {
      return buildFailureResult(
        "back",

        previous,

        "Back button was not found.",
      );
    }

    if (
      button.getAttribute(
        "aria-disabled",
      ) === "true" ||
      (
        button instanceof
          HTMLButtonElement &&
        button.disabled
      )
    ) {
      return buildFailureResult(
        "back",

        previous,

        "Back button is currently disabled.",
      );
    }

    const oldUrl =
      window.location.href;

    const mutationPromise =
      waitForDomMutation({
        timeoutMs:
          8000,
      });

    button.scrollIntoView({
      block: "center",
    });

    button.click();

    await mutationPromise;

    const pageChanged =
      await waitForCondition(
        () => {
          const state =
            scanWorkdayNavigationState();

          return (
            window.location.href !==
              oldUrl ||
            state.currentStep !==
              previous.currentStep
          );
        },
        10000,
        200,
      );

    if (!pageChanged) {
      const current =
        scanWorkdayNavigationState();

      return {
        action:
          "back",

        navigated:
          false,

        previousStep:
          previous.currentStep,

        currentStep:
          current.currentStep,

        reason:
          "Workday did not confirm back navigation.",

        state:
          current,
      };
    }

    const current =
      await waitForStableNavigationState(
        previous,
        oldUrl,
      );

    const successfullyChanged =
      current.currentStep !==
        previous.currentStep &&
      current.currentStep !==
        "unknown";

    return {
      action:
        "back",

      navigated:
        successfullyChanged,

      previousStep:
        previous.currentStep,

      currentStep:
        current.currentStep,

      reason:
        successfullyChanged
          ? `Navigated from ${previous.currentStepTitle} to ${current.currentStepTitle} successfully.`
          : "Workday back navigation occurred, but the previous step could not be identified reliably.",

      state:
        current,
    };
  };