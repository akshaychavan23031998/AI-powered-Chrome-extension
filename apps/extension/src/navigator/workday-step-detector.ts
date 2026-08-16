import type {
  WorkdayNavigationState,
  WorkdayStepDescriptor,
  WorkdayStepKind,
} from "../types/navigation";

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

const inferStepKind = (
  text: string,
): WorkdayStepKind => {
  const value =
    normalize(text);

  if (
    value.includes(
      "my information",
    )
  ) {
    return "myInformation";
  }

  if (
    value.includes(
      "my experience",
    )
  ) {
    return "myExperience";
  }

  if (
    value.includes(
      "application questions",
    )
  ) {
    return "applicationQuestions";
  }

  if (
    value.includes(
      "voluntary disclosures",
    )
  ) {
    return "voluntaryDisclosures";
  }

  if (
    value.includes(
      "self identify",
    ) ||
    value.includes(
      "self-identify",
    )
  ) {
    return "selfIdentify";
  }

  if (
    value === "review" ||
    value.includes(
      "review application",
    )
  ) {
    return "review";
  }

  return "unknown";
};

const getStepTitle = (
  kind: WorkdayStepKind,
): string => {
  switch (kind) {
    case "myInformation":
      return "My Information";

    case "myExperience":
      return "My Experience";

    case "applicationQuestions":
      return "Application Questions";

    case "voluntaryDisclosures":
      return "Voluntary Disclosures";

    case "selfIdentify":
      return "Self Identify";

    case "review":
      return "Review";

    default:
      return "Unknown";
  }
};

const getButtonText = (
  element: HTMLElement,
): string => {
  return cleanText(
    element.getAttribute(
      "aria-label",
    ) ??
      element.textContent,
  );
};

const getVisibleButtons =
  (): HTMLElement[] => {
    return Array.from(
      document.querySelectorAll<HTMLElement>(
        [
          "button",
          "[role='button']",
        ].join(","),
      ),
    ).filter(
      isVisible,
    );
  };

const findButtonByText = (
  patterns: string[],
): HTMLElement | undefined => {
  const normalizedPatterns =
    patterns.map(
      normalize,
    );

  return getVisibleButtons().find(
    (button) => {
      const text =
        normalize(
          getButtonText(
            button,
          ),
        );

      return normalizedPatterns.some(
        (pattern) =>
          text === pattern ||
          text.includes(
            pattern,
          ),
      );
    },
  );
};

const detectCurrentStepFromHeadings =
  (): WorkdayStepKind => {
    const candidates =
      Array.from(
        document.querySelectorAll<HTMLElement>(
          [
            "h1",
            "h2",
            "h3",
            "[role='heading']",
          ].join(","),
        ),
      ).filter(
        isVisible,
      );

    for (
      const element of candidates
    ) {
      const kind =
        inferStepKind(
          cleanText(
            element.textContent,
          ),
        );

      if (
        kind !== "unknown"
      ) {
        return kind;
      }
    }

    return "unknown";
  };

const detectStepsFromPage =
  (): WorkdayStepDescriptor[] => {
    const pageText =
      cleanText(
        document.body?.innerText,
      );

    const knownSteps:
      WorkdayStepKind[] = [
        "myInformation",
        "myExperience",
        "applicationQuestions",
        "voluntaryDisclosures",
        "selfIdentify",
        "review",
      ];

    const currentStep =
      detectCurrentStepFromHeadings();

    const descriptors:
      WorkdayStepDescriptor[] =
      [];

    let detectedIndex =
      0;

    for (
      const kind of knownSteps
    ) {
      const title =
        getStepTitle(
          kind,
        );

      if (
        !normalize(
          pageText,
        ).includes(
          normalize(
            title,
          ),
        )
      ) {
        continue;
      }

      detectedIndex += 1;

      descriptors.push({
        kind,

        title,

        index:
          detectedIndex,

        isCurrent:
          kind ===
          currentStep,

        isCompleted:
          currentStep !==
            "unknown" &&
          detectedIndex <
            knownSteps.indexOf(
              currentStep,
            ) +
              1,
      });
    }

    const total =
      descriptors.length;

    return descriptors.map(
      (step) => ({
        ...step,

        totalSteps:
          total,
      }),
    );
  };

export const scanWorkdayNavigationState =
  (): WorkdayNavigationState => {
    const currentStep =
      detectCurrentStepFromHeadings();

    const steps =
      detectStepsFromPage();

    const currentDescriptor =
      steps.find(
        (step) =>
          step.kind ===
          currentStep,
      );

    const continueButton =
      findButtonByText([
        "save and continue",
        "continue",
        "next",
      ]);

    const backButton =
      findButtonByText([
        "back",
        "previous",
      ]);

    const submitButton =
      findButtonByText([
        "submit",
        "submit application",
      ]);

    return {
      url:
        window.location.href,

      pageTitle:
        document.title,

      scannedAt:
        new Date().toISOString(),

      currentStep,

      currentStepTitle:
        getStepTitle(
          currentStep,
        ),

      currentStepIndex:
        currentDescriptor
          ?.index,

      totalSteps:
        steps.length ||
        undefined,

      steps,

      canGoBack:
        Boolean(
          backButton,
        ),

      canContinue:
        Boolean(
          continueButton,
        ) &&
        !submitButton,

      submitDetected:
        Boolean(
          submitButton,
        ),

      continueButtonText:
        continueButton
          ? getButtonText(
              continueButton,
            )
          : undefined,

      backButtonText:
        backButton
          ? getButtonText(
              backButton,
            )
          : undefined,
    };
  };