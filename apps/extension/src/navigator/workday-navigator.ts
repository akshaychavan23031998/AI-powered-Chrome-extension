import {
  waitForCondition,
  waitForDomMutation,
} from "../dynamic/mutation-waiter";

import {
  recoverAfterWorkdayAction,
} from "../recovery/workday-error-recovery";

import type {
  WorkdayNavigationResult,
  WorkdayNavigationState,
} from "../types/navigation";

import {
  validateWorkdayPage,
} from "../validation/workday-validator";

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

    await sleep(
      250,
    );

    return scanWorkdayNavigationState();
  };

const hasNavigationChanged = (
  previous:
    WorkdayNavigationState,

  oldUrl: string,
): boolean => {
  const current =
    scanWorkdayNavigationState();

  return (
    window.location.href !==
      oldUrl ||
    (
      current.currentStep !==
        previous.currentStep &&
      current.currentStep !==
        "unknown"
    )
  );
};

export const navigateWorkdayContinue =
  async (): Promise<WorkdayNavigationResult> => {
    const previous =
      scanWorkdayNavigationState();

    if (
      previous.submitDetected
    ) {
      return buildFailureResult(
        "continue",

        previous,

        "Submit button detected. Automatic submit is blocked.",
      );
    }

    /*
     * Phase 12:
     * Validate the current Workday step before attempting
     * Save & Continue.
     */
    const validation =
      validateWorkdayPage();

    if (
      !validation.valid
    ) {
      return buildFailureResult(
        "continue",

        previous,

        `Navigation blocked because ${validation.errorCount} validation error(s) were detected on the current Workday step.`,
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

    /*
     * Important:
     * Click exactly once.
     *
     * Recovery retries below only check whether Workday
     * completed the transition. They never click again.
     */
    button.click();

    await mutationPromise;

    const recovery =
      await recoverAfterWorkdayAction(
        async () => {
          return hasNavigationChanged(
            previous,
            oldUrl,
          );
        },

        {
          attempts: 3,
          delayMs: 450,
          backoffMultiplier:
            1.5,
          waitForDomMs:
            2500,
        },
      );

    if (
      !recovery.success
    ) {
      const current =
        scanWorkdayNavigationState();

      const postClickValidation =
        validateWorkdayPage();

      const reason =
        postClickValidation.valid
          ? recovery.finalMessage
          : `Workday blocked navigation with ${postClickValidation.errorCount} validation error(s).`;

      return {
        action:
          "continue",

        navigated:
          false,

        previousStep:
          previous.currentStep,

        currentStep:
          current.currentStep,

        reason,

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

    const recovery =
      await recoverAfterWorkdayAction(
        async () => {
          return hasNavigationChanged(
            previous,
            oldUrl,
          );
        },

        {
          attempts: 3,
          delayMs: 350,
          backoffMultiplier:
            1.5,
          waitForDomMs:
            2000,
        },
      );

    if (
      !recovery.success
    ) {
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
          recovery.finalMessage,

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