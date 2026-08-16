import {
  retryOperation,
} from "./retry";

import {
  waitForDomToSettle,
} from "./dom-waiter";

import type {
  RecoveryAttempt,
  RecoveryFailureReason,
  RecoveryResult,
  WorkdayRecoveryOptions,
} from "../types/recovery";

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

const isVisible = (
  element: HTMLElement,
): boolean => {
  const style =
    window.getComputedStyle(
      element,
    );

  const rect =
    element.getBoundingClientRect();

  return (
    style.display !==
      "none" &&
    style.visibility !==
      "hidden" &&
    rect.width > 0 &&
    rect.height > 0
  );
};

const getVisibleWorkdayErrors =
  (): string[] => {
    const selectors = [
      "[role='alert']",
      "[aria-live='assertive']",
      "[data-automation-id*='error']",
      "[data-automation-id*='validation']",
    ];

    const messages =
      new Set<string>();

    for (
      const selector of
        selectors
    ) {
      const elements =
        Array.from(
          document.querySelectorAll<HTMLElement>(
            selector,
          ),
        );

      for (
        const element of
          elements
      ) {
        if (
          !isVisible(
            element,
          )
        ) {
          continue;
        }

        const text =
          cleanText(
            element.textContent,
          );

        if (
          !text ||
          text.length >
            500
        ) {
          continue;
        }

        messages.add(
          text,
        );
      }
    }

    return Array.from(
      messages,
    );
  };

const hasInvalidControls =
  (): boolean => {
    const invalid =
      Array.from(
        document.querySelectorAll<HTMLElement>(
          "[aria-invalid='true']",
        ),
      );

    return invalid.some(
      isVisible,
    );
  };

export const detectRecoveryFailureReason =
  ():
    RecoveryFailureReason |
    undefined => {
    if (
      getVisibleWorkdayErrors()
        .length > 0 ||
      hasInvalidControls()
    ) {
      return "validation-blocked";
    }

    return undefined;
  };

export const recoverAfterWorkdayAction =
  async (
    action:
      () =>
        Promise<boolean> |
        boolean,

    options:
      WorkdayRecoveryOptions = {},
  ): Promise<RecoveryResult> => {
    const attempts:
      RecoveryAttempt[] =
      [];

    const maxAttempts =
      Math.max(
        1,
        options.attempts ??
          3,
      );

    const {
      result,
      attempts:
        retryAttempts,
    } =
      await retryOperation(
        async (
          attempt,
        ) => {
          await waitForDomToSettle(
            250,
            options.waitForDomMs ??
              2500,
          );

          const success =
            await action();

          if (
            success
          ) {
            return true;
          }

          await waitForDomToSettle(
            300,
            options.waitForDomMs ??
              3000,
          );

          /*
           * A missed first check is normal on Workday because
           * navigation can render asynchronously.
           *
           * Keep this as debug information rather than a warning
           * so Chrome does not surface a successful recovery cycle
           * as an extension error.
           */
          console.debug(
            `Workday recovery attempt ${attempt} is still waiting for the expected state change.`,
          );

          return false;
        },

        (success) =>
          success,

        {
          attempts:
            maxAttempts,

          delayMs:
            options.delayMs ??
            400,

          backoffMultiplier:
            options.backoffMultiplier ??
            1.5,
        },
      );

    attempts.push(
      ...retryAttempts,
    );

    const failureReason =
      result
        ? undefined
        : detectRecoveryFailureReason() ??
          "operation-failed";

    const recoveryResult:
      RecoveryResult = {
      success:
        result,

      reason:
        failureReason,

      attempts,

      totalAttempts:
        attempts.length,

      finalMessage:
        result
          ? "Workday operation recovered successfully."
          : failureReason ===
              "validation-blocked"
            ? "Workday validation errors are blocking the operation. Manual correction may be required."
            : `Workday operation failed after ${attempts.length} attempt(s).`,
    };

    console.log(
      "Workday recovery result:",
      recoveryResult,
    );

    return recoveryResult;
  };

export const recoverElementInteraction =
  async (
    selector: string,

    interaction:
      (
        element:
          HTMLElement,
      ) =>
        Promise<boolean> |
        boolean,

    options:
      WorkdayRecoveryOptions = {},
  ): Promise<RecoveryResult> => {
    return recoverAfterWorkdayAction(
      async () => {
        const element =
          document.querySelector<HTMLElement>(
            selector,
          );

        if (
          !element
        ) {
          return false;
        }

        if (
          !isVisible(
            element,
          )
        ) {
          return false;
        }

        return interaction(
          element,
        );
      },

      options,
    );
  };