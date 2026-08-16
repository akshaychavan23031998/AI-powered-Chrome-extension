import {
  scanWorkdayNavigationState,
} from "../navigator/workday-step-detector";

import {
  scanWorkdayReview,
} from "../review/workday-review";

import type {
  WorkdaySubmitResult,
} from "../types/review";

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

const findSubmitButton =
  (): HTMLElement | undefined => {
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
      (element) => {
        const text =
          normalize(
            element.getAttribute(
              "aria-label",
            ) ??
              element.textContent ??
              "",
          );

        return (
          text ===
            "submit" ||
          text ===
            "submit application"
        );
      },
    );
  };

const isSubmitDisabled = (
  element: HTMLElement,
): boolean => {
  if (
    element.getAttribute(
      "aria-disabled",
    ) === "true"
  ) {
    return true;
  }

  if (
    element instanceof
      HTMLButtonElement
  ) {
    return element.disabled;
  }

  return false;
};

const isCompletedApplicationPage =
  (): boolean => {
    const url =
      window.location.href.toLowerCase();

    if (
      url.includes(
        "/jobtasks/completed/application",
      )
    ) {
      return true;
    }

    const pageText =
      normalize(
        document.body?.innerText ??
          document.body?.textContent ??
          "",
      );

    return (
      pageText.includes(
        "application submitted",
      ) ||
      pageText.includes(
        "your application has been successfully submitted",
      )
    );
  };

const createBlockedResult = (
  previousUrl: string,
  message: string,
  reviewStillDetected:
    boolean,
): WorkdaySubmitResult => {
  return {
    submitted: false,

    previousUrl,

    currentUrl:
      window.location.href,

    message,

    reviewStillDetected,
  };
};

export const submitWorkdayApplication =
  async (
    explicitlyConfirmed:
      boolean,
  ): Promise<WorkdaySubmitResult> => {
    const previousUrl =
      window.location.href;

    /*
     * A completed Workday application page is already
     * definitive confirmation that submission succeeded.
     *
     * This is useful if the extension scans the page again
     * after Workday has completed its navigation.
     */
    if (
      isCompletedApplicationPage()
    ) {
      const result:
        WorkdaySubmitResult = {
        submitted: true,

        previousUrl,

        currentUrl:
          window.location.href,

        message:
          "Workday confirms that the application was successfully submitted.",

        reviewStillDetected:
          false,
      };

      console.log(
        "Workday submit result:",
        result,
      );

      return result;
    }

    /*
     * Safety gate #1:
     *
     * Submission can never happen unless the popup explicitly
     * sends true after direct user confirmation.
     */
    if (
      explicitlyConfirmed !==
      true
    ) {
      return createBlockedResult(
        previousUrl,

        "Submission blocked because explicit user confirmation was not provided.",

        scanWorkdayNavigationState()
          .currentStep ===
          "review",
      );
    }

    /*
     * Safety gate #2:
     *
     * Submit is only permitted from Workday's final Review step.
     */
    const review =
      scanWorkdayReview();

    if (
      !review.isReviewStep
    ) {
      return createBlockedResult(
        previousUrl,

        "Submission blocked because the current Workday step is not Review.",

        false,
      );
    }

    /*
     * Safety gate #3:
     *
     * Review scanner includes validation and submit detection.
     */
    if (
      !review.readyForConfirmation
    ) {
      return createBlockedResult(
        previousUrl,

        review.reason,

        true,
      );
    }

    const button =
      findSubmitButton();

    if (
      !button
    ) {
      return createBlockedResult(
        previousUrl,

        "Submit button could not be found.",

        true,
      );
    }

    if (
      isSubmitDisabled(
        button,
      )
    ) {
      return createBlockedResult(
        previousUrl,

        "Submit button is currently disabled.",

        true,
      );
    }

    /*
     * CRITICAL SAFETY RULE
     * --------------------
     *
     * Submit is clicked exactly ONCE.
     *
     * Do not use retryOperation().
     * Do not use recoveryAfterWorkdayAction().
     * Do not recursively invoke this function.
     *
     * Workday commonly destroys the current document immediately
     * after a successful submission. Waiting inside this content
     * script for the next page can therefore destroy the Chrome
     * messaging channel before sendResponse reaches the service
     * worker.
     *
     * For that reason we acknowledge the single submit action
     * immediately after dispatching it.
     */
    button.scrollIntoView({
      block: "center",
    });

    button.click();

    const result:
      WorkdaySubmitResult = {
      submitted: true,

      previousUrl,

      currentUrl:
        window.location.href,

      message:
        "Submit was clicked once after explicit user confirmation. Workday is processing the application.",

      /*
       * At this exact instant the Review DOM may still exist.
       * We intentionally do not wait because navigation can destroy
       * this content script and its response channel.
       */
      reviewStillDetected:
        false,
    };

    console.log(
      "Workday submit action initiated:",
      result,
    );

    return result;
  };