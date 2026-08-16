import {
  scanWorkdayNavigationState,
} from "../navigator/workday-step-detector";

import type {
  ReviewSection,
  WorkdayReviewResult,
} from "../types/review";

import {
  validateWorkdayPage,
} from "../validation/workday-validator";

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

const createSectionId = (
  title: string,
  index: number,
): string => {
  return `${normalize(
    title,
  )
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )}-${index}`;
};

const isApplicationSubmittedPage =
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

const findReviewSections =
  (): ReviewSection[] => {
    const headings =
      Array.from(
        document.querySelectorAll<HTMLElement>(
          [
            "h2",
            "h3",
            "[role='heading']",
          ].join(","),
        ),
      ).filter(
        isVisible,
      );

    const sections:
      ReviewSection[] = [];

    const seenTitles =
      new Set<string>();

    for (
      const heading of
        headings
    ) {
      const title =
        cleanText(
          heading.textContent,
        );

      if (
        !title ||
        normalize(
          title,
        ) === "review"
      ) {
        continue;
      }

      const normalizedTitle =
        normalize(
          title,
        );

      if (
        seenTitles.has(
          normalizedTitle,
        )
      ) {
        continue;
      }

      const container =
        heading.closest<HTMLElement>(
          [
            "section",
            "[role='group']",
            "[data-automation-id]",
            "div",
          ].join(","),
        );

      const text =
        cleanText(
          container?.textContent ??
            heading.parentElement
              ?.textContent,
        );

      if (
        !text ||
        text.length <
          title.length
      ) {
        continue;
      }

      seenTitles.add(
        normalizedTitle,
      );

      sections.push({
        id:
          createSectionId(
            title,
            sections.length,
          ),

        title,

        text,
      });
    }

    return sections;
  };

export const scanWorkdayReview =
  (): WorkdayReviewResult => {
    const applicationSubmitted =
      isApplicationSubmittedPage();

    /*
     * Completed application page is no longer a Review page.
     *
     * Return immediately so the extension does not display
     * "Not ready for submission" after Workday has already
     * confirmed the application.
     */
    if (
      applicationSubmitted
    ) {
      const result:
        WorkdayReviewResult = {
        url:
          window.location.href,

        title:
          document.title,

        scannedAt:
          new Date().toISOString(),

        isReviewStep:
          false,

        applicationSubmitted:
          true,

        sectionCount:
          0,

        sections: [],

        submitDetected:
          false,

        readyForConfirmation:
          false,

        reason:
          "Workday confirms that the application has already been submitted successfully.",
      };

      console.log(
        "Workday review scan completed:",
        result,
      );

      return result;
    }

    const navigation =
      scanWorkdayNavigationState();

    const isReviewStep =
      navigation.currentStep ===
      "review";

    const validation =
      validateWorkdayPage();

    const sections =
      isReviewStep
        ? findReviewSections()
        : [];

    const submitDetected =
      Boolean(
        navigation.submitDetected,
      );

    const readyForConfirmation =
      isReviewStep &&
      submitDetected &&
      validation.valid;

    let reason =
      "Current Workday step is not the Review page.";

    if (
      isReviewStep &&
      !submitDetected
    ) {
      reason =
        "Review page detected, but Submit is not available.";
    } else if (
      isReviewStep &&
      !validation.valid
    ) {
      reason =
        `Review page has ${validation.errorCount} validation error(s).`;
    } else if (
      readyForConfirmation
    ) {
      reason =
        "Review page is ready. Explicit user confirmation is required before submission.";
    }

    const result:
      WorkdayReviewResult = {
      url:
        window.location.href,

      title:
        document.title,

      scannedAt:
        new Date().toISOString(),

      isReviewStep,

      applicationSubmitted:
        false,

      sectionCount:
        sections.length,

      sections,

      submitDetected,

      readyForConfirmation,

      reason,
    };

    console.log(
      "Workday review scan completed:",
      result,
    );

    return result;
  };