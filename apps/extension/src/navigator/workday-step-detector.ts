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
    normalize(
      text,
    );

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

const knownSteps:
  WorkdayStepKind[] = [
    "myInformation",
    "myExperience",
    "applicationQuestions",
    "voluntaryDisclosures",
    "selfIdentify",
    "review",
  ];

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
      const element of
        candidates
    ) {
      const kind =
        inferStepKind(
          cleanText(
            element.textContent,
          ),
        );

      if (
        kind !==
        "unknown"
      ) {
        return kind;
      }
    }

    return "unknown";
  };

interface ProgressMetadata {
  currentIndex?: number;
  totalSteps?: number;
}

const collectProgressCorpus =
  (): string => {
    const values =
      new Set<string>();

    const bodyInnerText =
      cleanText(
        document.body
          ?.innerText,
      );

    const bodyTextContent =
      cleanText(
        document.body
          ?.textContent,
      );

    if (
      bodyInnerText
    ) {
      values.add(
        bodyInnerText,
      );
    }

    if (
      bodyTextContent
    ) {
      values.add(
        bodyTextContent,
      );
    }

    const accessibleElements =
      Array.from(
        document.querySelectorAll<HTMLElement>(
          [
            "[aria-label]",
            "[aria-current]",
            "[role='listitem']",
            "[role='tab']",
            "[role='status']",
            "[data-automation-id]",
          ].join(","),
        ),
      );

    for (
      const element of
        accessibleElements
    ) {
      const ariaLabel =
        cleanText(
          element.getAttribute(
            "aria-label",
          ),
        );

      if (
        ariaLabel
      ) {
        values.add(
          ariaLabel,
        );
      }

      const text =
        cleanText(
          element.textContent,
        );

      if (
        text
      ) {
        values.add(
          text,
        );
      }
    }

    return Array.from(
      values,
    ).join(" ");
  };

const detectProgressMetadata =
  (): ProgressMetadata => {
    const corpus =
      normalize(
        collectProgressCorpus(),
      );

    const currentMatch =
      corpus.match(
        /current\s+step\s+(\d+)\s+of\s+(\d+)/i,
      );

    if (
      currentMatch
    ) {
      return {
        currentIndex:
          Number(
            currentMatch[1],
          ),

        totalSteps:
          Number(
            currentMatch[2],
          ),
      };
    }

    const genericMatches =
      Array.from(
        corpus.matchAll(
          /(?:completed\s+)?step\s+(\d+)\s+of\s+(\d+)/gi,
        ),
      );

    if (
      genericMatches.length >
      0
    ) {
      const totals =
        genericMatches
          .map(
            (match) =>
              Number(
                match[2],
              ),
          )
          .filter(
            (value) =>
              Number.isFinite(
                value,
              ) &&
              value > 0,
          );

      const totalSteps =
        totals.length > 0
          ? Math.max(
              ...totals,
            )
          : undefined;

      return {
        totalSteps,
      };
    }

    return {};
  };

const detectStepKindsFromCorpus =
  (): WorkdayStepKind[] => {
    const corpus =
      normalize(
        collectProgressCorpus(),
      );

    return knownSteps.filter(
      (kind) =>
        corpus.includes(
          normalize(
            getStepTitle(
              kind,
            ),
          ),
        ),
    );
  };

const detectStepsFromPage =
  (
    currentStep:
      WorkdayStepKind,

    progress:
      ProgressMetadata,
  ): WorkdayStepDescriptor[] => {
    const detectedKinds =
      detectStepKindsFromCorpus();

    /*
     * Prefer the labels Workday actually exposes.
     */
    let stepKinds =
      detectedKinds;

    /*
     * On some Workday tenants, only the active step label
     * is visually rendered while the progress component
     * exposes "current step X of Y" through accessibility
     * metadata.
     *
     * When the declared total matches our supported standard
     * six-step Workday flow, use that canonical order.
     */
    if (
      progress.totalSteps ===
        knownSteps.length &&
      detectedKinds.length <
        progress.totalSteps
    ) {
      stepKinds =
        [...knownSteps];
    }

    /*
     * Absolute fallback: never return an empty descriptor list
     * when the current step itself was detected.
     */
    if (
      stepKinds.length === 0 &&
      currentStep !==
        "unknown"
    ) {
      stepKinds = [
        currentStep,
      ];
    }

    return stepKinds.map(
      (
        kind,
        arrayIndex,
      ) => {
        const index =
          arrayIndex + 1;

        return {
          kind,

          title:
            getStepTitle(
              kind,
            ),

          index,

          totalSteps:
            progress.totalSteps ??
            stepKinds.length,

          isCurrent:
            kind ===
            currentStep,

          isCompleted:
            currentStep !==
              "unknown" &&
            (
              progress.currentIndex
                ? index <
                  progress.currentIndex
                : knownSteps.indexOf(
                    kind,
                  ) <
                  knownSteps.indexOf(
                    currentStep,
                  )
            ),
        };
      },
    );
  };

export const scanWorkdayNavigationState =
  (): WorkdayNavigationState => {
    const currentStep =
      detectCurrentStepFromHeadings();

    const progress =
      detectProgressMetadata();

    const steps =
      detectStepsFromPage(
        currentStep,
        progress,
      );

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
        progress.currentIndex ??
        currentDescriptor
          ?.index,

      totalSteps:
        progress.totalSteps ??
        (
          steps.length >
            1
            ? steps.length
            : undefined
        ),

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