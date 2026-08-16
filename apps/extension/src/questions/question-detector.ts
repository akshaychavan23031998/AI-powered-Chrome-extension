import {
  classifyQuestion,
} from "./question-classifier";

import type {
  DetectedQuestion,
  QuestionControlKind,
  QuestionScanResult,
} from "../types/question";

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

const canonicalize = (
  value: string,
): string => {
  return normalize(
    value
      .replace(/\*+/g, "")
      .replace(
        /\d+\s+items?\s+selected.*$/i,
        "",
      )
      .replace(
        /select one.*$/i,
        "",
      ),
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

const getControlKind = (
  element: HTMLElement,
): QuestionControlKind => {
  if (
    element instanceof
      HTMLTextAreaElement
  ) {
    return "textarea";
  }

  if (
    element instanceof
      HTMLSelectElement
  ) {
    return "select";
  }

  if (
    element instanceof
      HTMLInputElement
  ) {
    if (
      element.type ===
        "radio"
    ) {
      return "radio";
    }

    if (
      element.type ===
        "checkbox"
    ) {
      return "checkbox";
    }

    if (
      element.getAttribute(
        "role",
      ) === "combobox"
    ) {
      return "combobox";
    }

    if (
      [
        "text",
        "email",
        "tel",
        "number",
        "search",
      ].includes(
        element.type,
      )
    ) {
      return "text";
    }
  }

  if (
    element.getAttribute(
      "role",
    ) === "checkbox"
  ) {
    return "checkbox";
  }

  if (
    element.getAttribute(
      "role",
    ) === "combobox" ||
    element.getAttribute(
      "aria-haspopup",
    ) === "listbox"
  ) {
    return "combobox";
  }

  return "unknown";
};

const getAriaTexts = (
  element: HTMLElement,
): string[] => {
  const values:
    string[] = [];

  const ariaLabel =
    cleanText(
      element.getAttribute(
        "aria-label",
      ),
    );

  if (
    ariaLabel
  ) {
    values.push(
      ariaLabel,
    );
  }

  const labelledBy =
    element.getAttribute(
      "aria-labelledby",
    );

  if (
    labelledBy
  ) {
    for (
      const id of
        labelledBy.split(
          /\s+/,
        )
    ) {
      const target =
        document.getElementById(
          id,
        );

      const text =
        cleanText(
          target?.textContent,
        );

      if (
        text
      ) {
        values.push(
          text,
        );
      }
    }
  }

  return values;
};

const getExplicitLabels = (
  element: HTMLElement,
): string[] => {
  if (
    !element.id
  ) {
    return [];
  }

  return Array.from(
    document.querySelectorAll<HTMLLabelElement>(
      `label[for="${CSS.escape(
        element.id,
      )}"]`,
    ),
  )
    .map(
      (label) =>
        cleanText(
          label.textContent,
        ),
    )
    .filter(
      Boolean,
    );
};

const getWrappingLabel = (
  element: HTMLElement,
): string | undefined => {
  const label =
    element.closest(
      "label",
    );

  const text =
    cleanText(
      label?.textContent,
    );

  return (
    text ||
    undefined
  );
};

const getDirectLabels = (
  element: HTMLElement,
): string[] => {
  const labels = [
    ...getAriaTexts(
      element,
    ),
    ...getExplicitLabels(
      element,
    ),
  ];

  const wrappingLabel =
    getWrappingLabel(
      element,
    );

  if (
    wrappingLabel
  ) {
    labels.push(
      wrappingLabel,
    );
  }

  return Array.from(
    new Set(
      labels
        .map(
          cleanText,
        )
        .filter(
          Boolean,
        ),
    ),
  );
};

const collectNearbyTexts = (
  element: HTMLElement,
  maxDepth = 6,
): string[] => {
  const values =
    new Set<string>();

  let current:
    HTMLElement | null =
      element.parentElement;

  for (
    let depth = 0;
    depth < maxDepth &&
    current;
    depth += 1
  ) {
    const nodes =
      current.querySelectorAll<HTMLElement>(
        [
          "label",
          "legend",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "[role='heading']",
          "p",
          "span",
        ].join(","),
      );

    for (
      const node of
        Array.from(
          nodes,
        )
    ) {
      const text =
        cleanText(
          node.textContent,
        );

      if (
        text &&
        text.length <=
          500
      ) {
        values.add(
          text,
        );
      }
    }

    const ownText =
      cleanText(
        current.textContent,
      );

    if (
      ownText &&
      ownText.length <=
        500
    ) {
      values.add(
        ownText,
      );
    }

    current =
      current.parentElement;
  }

  return Array.from(
    values,
  );
};

const isNoise = (
  value: string,
): boolean => {
  const text =
    normalize(
      value,
    );

  return (
    !text ||
    text === "yes" ||
    text === "no" ||
    text === "select one" ||
    text === "please select one"
  );
};

const findConsentLabel = (
  values: string[],
): string | undefined => {
  return values.find(
    (value) => {
      const category =
        classifyQuestion(
          value,
        ).category;

      return (
        category ===
        "consent"
      );
    },
  );
};

const findSensitiveLabel = (
  values: string[],
): string | undefined => {
  const candidates =
    values.filter(
      (value) =>
        classifyQuestion(
          value,
        ).sensitivity ===
        "sensitive",
    );

  candidates.sort(
    (
      left,
      right,
    ) => {
      const leftNormalized =
        normalize(
          left,
        );

      const rightNormalized =
        normalize(
          right,
        );

      const leftScore =
        (
          leftNormalized.includes(
            "self-identification",
          ) ||
          leftNormalized.includes(
            "self identification",
          )
            ? 20
            : 0
        ) +
        (
          leftNormalized.includes(
            "gender",
          )
            ? 10
            : 0
        ) -
        left.length /
          100;

      const rightScore =
        (
          rightNormalized.includes(
            "self-identification",
          ) ||
          rightNormalized.includes(
            "self identification",
          )
            ? 20
            : 0
        ) +
        (
          rightNormalized.includes(
            "gender",
          )
            ? 10
            : 0
        ) -
        right.length /
          100;

      return (
        rightScore -
        leftScore
      );
    },
  );

  return (
    candidates[0]
  );
};

const findQuestionLabel = (
  values: string[],
): string | undefined => {
  return values.find(
    (value) =>
      !isNoise(
        value,
      ) &&
      value.includes(
        "?",
      ),
  );
};

const findClassifiedLabel = (
  values: string[],
): string | undefined => {
  return values.find(
    (value) => {
      if (
        isNoise(
          value,
        )
      ) {
        return false;
      }

      return (
        classifyQuestion(
          value,
        ).category !==
        "custom"
      );
    },
  );
};

const getQuestionLabel = (
  element: HTMLElement,
  controlKind:
    QuestionControlKind,
): string => {
  const directLabels =
    getDirectLabels(
      element,
    );

  /*
   * Checkboxes must use their own label first.
   *
   * This prevents a consent checkbox from inheriting
   * the nearby gender heading.
   */
  if (
    controlKind ===
      "checkbox"
  ) {
    const directConsent =
      findConsentLabel(
        directLabels,
      );

    if (
      directConsent
    ) {
      return directConsent;
    }

    const directQuestion =
      findQuestionLabel(
        directLabels,
      );

    if (
      directQuestion
    ) {
      return directQuestion;
    }

    const nearby =
      collectNearbyTexts(
        element,
        3,
      );

    const nearbyConsent =
      findConsentLabel(
        nearby,
      );

    if (
      nearbyConsent
    ) {
      return nearbyConsent;
    }

    return (
      directLabels.find(
        (value) =>
          !isNoise(
            value,
          ),
      ) ??
      ""
    );
  }

  const nearby =
    collectNearbyTexts(
      element,
    );

  const allValues = [
    ...directLabels,
    ...nearby,
  ];

  /*
   * Workday proprietary voluntary disclosure
   * dropdowns often expose only "Select One"
   * directly on the actual button/input.
   *
   * Therefore for combobox controls, prefer a nearby
   * sensitive heading such as
   * "Self-Identification of Gender".
   */
  if (
    controlKind ===
      "combobox"
  ) {
    const sensitiveLabel =
      findSensitiveLabel(
        allValues,
      );

    if (
      sensitiveLabel
    ) {
      return sensitiveLabel;
    }
  }

  const questionLabel =
    findQuestionLabel(
      allValues,
    );

  if (
    questionLabel
  ) {
    return questionLabel;
  }

  const classifiedLabel =
    findClassifiedLabel(
      allValues,
    );

  if (
    classifiedLabel
  ) {
    return classifiedLabel;
  }

  return (
    directLabels.find(
      (value) =>
        !isNoise(
          value,
        ),
    ) ??
    ""
  );
};

const getOptions = (
  element: HTMLElement,
): string[] => {
  if (
    element instanceof
      HTMLSelectElement
  ) {
    return Array.from(
      element.options,
    )
      .map(
        (option) =>
          cleanText(
            option.textContent,
          ),
      )
      .filter(
        Boolean,
      );
  }

  if (
    element instanceof
      HTMLInputElement &&
    element.type ===
      "radio" &&
    element.name
  ) {
    return Array.from(
      document.querySelectorAll<HTMLInputElement>(
        `input[type="radio"][name="${CSS.escape(
          element.name,
        )}"]`,
      ),
    )
      .map(
        (radio) => {
          const labels =
            getExplicitLabels(
              radio,
            );

          return (
            labels[0] ||
            cleanText(
              radio.value,
            )
          );
        },
      )
      .filter(
        Boolean,
      );
  }

  return [];
};

const findSelectedComboboxText = (
  element: HTMLElement,
): string | undefined => {
  const ariaValue =
    cleanText(
      element.getAttribute(
        "aria-valuetext",
      ),
    );

  if (
    ariaValue &&
    !normalize(
      ariaValue,
    ).includes(
      "select one",
    )
  ) {
    return ariaValue;
  }

  const value =
    element instanceof
      HTMLInputElement
      ? cleanText(
          element.value,
        )
      : "";

  if (
    value &&
    !normalize(
      value,
    ).includes(
      "select one",
    )
  ) {
    return value;
  }

  let current:
    HTMLElement | null =
      element.parentElement;

  for (
    let depth = 0;
    depth < 4 &&
    current;
    depth += 1
  ) {
    const text =
      cleanText(
        current.textContent,
      );

    if (
      /[1-9]\d*\s+items?\s+selected/i.test(
        text,
      ) &&
      !/0\s+items?\s+selected/i.test(
        text,
      )
    ) {
      return text;
    }

    current =
      current.parentElement;
  }

  return undefined;
};

const getCurrentValue = (
  element: HTMLElement,
  controlKind:
    QuestionControlKind,
): string | undefined => {
  if (
    controlKind ===
      "checkbox"
  ) {
    if (
      element instanceof
        HTMLInputElement
    ) {
      return element.checked
        ? element.value ||
            "checked"
        : undefined;
    }

    return element.getAttribute(
      "aria-checked",
    ) === "true"
      ? "checked"
      : undefined;
  }

  if (
    element instanceof
      HTMLInputElement &&
    element.type ===
      "radio"
  ) {
    if (
      element.name
    ) {
      const checked =
        document.querySelector<HTMLInputElement>(
          `input[type="radio"][name="${CSS.escape(
            element.name,
          )}"]:checked`,
        );

      return checked
        ? cleanText(
            checked.value,
          ) ||
            "checked"
        : undefined;
    }

    return element.checked
      ? element.value ||
          "checked"
      : undefined;
  }

  if (
    element instanceof
      HTMLSelectElement
  ) {
    const value =
      cleanText(
        element.value,
      );

    return (
      value &&
      normalize(
        value,
      ) !==
        "select one"
        ? value
        : undefined
    );
  }

  if (
    controlKind ===
      "combobox"
  ) {
    return findSelectedComboboxText(
      element,
    );
  }

  if (
    element instanceof
      HTMLInputElement ||
    element instanceof
      HTMLTextAreaElement
  ) {
    return (
      cleanText(
        element.value,
      ) ||
      undefined
    );
  }

  return undefined;
};

const buildQuestionId = (
  element: HTMLElement,
  index: number,
): string => {
  return (
    element.id ||
    element.getAttribute(
      "data-automation-id",
    ) ||
    element.getAttribute(
      "name",
    ) ||
    `question-${index}`
  );
};

const getSelectorHint = (
  element: HTMLElement,
): string | undefined => {
  if (
    element.id
  ) {
    return `#${CSS.escape(
      element.id,
    )}`;
  }

  const automationId =
    element.getAttribute(
      "data-automation-id",
    );

  if (
    automationId
  ) {
    return `[data-automation-id="${automationId}"]`;
  }

  if (
    element instanceof
      HTMLInputElement &&
    element.name
  ) {
    return `[name="${CSS.escape(
      element.name,
    )}"]`;
  }

  return undefined;
};

const isIgnoredQuestion = (
  label: string,
): boolean => {
  const value =
    normalize(
      label,
    );

  return (
    value.includes(
      "i have a preferred name",
    ) ||
    value ===
      "preferred name"
  );
};

const isPotentialQuestion = (
  label: string,
  controlKind:
    QuestionControlKind,
): boolean => {
  if (
    !label ||
    isIgnoredQuestion(
      label,
    )
  ) {
    return false;
  }

  const classification =
    classifyQuestion(
      label,
    );

  if (
    classification.category !==
      "custom"
  ) {
    return true;
  }

  if (
    label.includes(
      "?",
    )
  ) {
    return true;
  }

  if (
    controlKind ===
      "checkbox"
  ) {
    const text =
      normalize(
        label,
      );

    return (
      text.includes(
        "agree",
      ) ||
      text.includes(
        "accept",
      ) ||
      text.includes(
        "terms",
      ) ||
      text.includes(
        "privacy",
      )
    );
  }

  return false;
};

const hasNearbyRequiredMarker = (
  element: HTMLElement,
): boolean => {
  if (
    element.hasAttribute(
      "required",
    ) ||
    element.getAttribute(
      "aria-required",
    ) === "true"
  ) {
    return true;
  }

  let current:
    HTMLElement | null =
      element.parentElement;

  for (
    let depth = 0;
    depth < 4 &&
    current;
    depth += 1
  ) {
    const text =
      cleanText(
        current.textContent,
      );

    if (
      text.includes(
        "*",
      )
    ) {
      return true;
    }

    if (
      current.querySelector(
        "[required],[aria-required='true']",
      )
    ) {
      return true;
    }

    current =
      current.parentElement;
  }

  return false;
};

const getRequiredState = (
  element: HTMLElement,
  label: string,
): boolean => {
  return (
    label.includes(
      "*",
    ) ||
    hasNearbyRequiredMarker(
      element,
    )
  );
};

const getSemanticKey = (
  question:
    DetectedQuestion,
): string => {
  if (
    question.category ===
      "source"
  ) {
    return "source";
  }

  if (
    question.category ===
      "previousEmployment"
  ) {
    return "previousEmployment";
  }

  if (
    question.category ===
      "consent"
  ) {
    return "consent";
  }

  return [
    question.category,
    canonicalize(
      question.label,
    ),
  ].join(
    ":",
  );
};

const mergeQuestion = (
  questions:
    DetectedQuestion[],
  question:
    DetectedQuestion,
): void => {
  const key =
    getSemanticKey(
      question,
    );

  const index =
    questions.findIndex(
      (existing) =>
        getSemanticKey(
          existing,
        ) === key,
    );

  if (
    index === -1
  ) {
    questions.push(
      question,
    );

    return;
  }

  const existing =
    questions[
      index
    ];

  if (
    !existing.answered &&
    question.answered
  ) {
    questions[
      index
    ] =
      question;

    return;
  }

  if (
    existing.controlKind ===
      "text" &&
    question.controlKind ===
      "combobox"
  ) {
    questions[
      index
    ] =
      question;

    return;
  }

  if (
    !existing.required &&
    question.required
  ) {
    questions[
      index
    ] = {
      ...existing,
      required:
        true,
    };
  }
};

const getControls =
  (): HTMLElement[] => {
    return Array.from(
      document.querySelectorAll<HTMLElement>(
        [
          "input:not([type='hidden'])",
          "textarea",
          "select",
          "[role='combobox']",
          "[aria-haspopup='listbox']",
          "button[aria-haspopup='listbox']",
          "[role='checkbox']",
        ].join(","),
      ),
    ).filter(
      isVisible,
    );
  };

export const scanQuestions =
  (): QuestionScanResult => {
    const questions:
      DetectedQuestion[] =
      [];

    const processedRadioNames =
      new Set<string>();

    getControls().forEach(
      (
        control,
        index,
      ) => {
        if (
          control instanceof
            HTMLInputElement &&
          control.type ===
            "radio" &&
          control.name
        ) {
          if (
            processedRadioNames.has(
              control.name,
            )
          ) {
            return;
          }

          processedRadioNames.add(
            control.name,
          );
        }

        const controlKind =
          getControlKind(
            control,
          );

        const label =
          getQuestionLabel(
            control,
            controlKind,
          );

        if (
          !isPotentialQuestion(
            label,
            controlKind,
          )
        ) {
          return;
        }

        const classification =
          classifyQuestion(
            label,
          );

        const currentValue =
          getCurrentValue(
            control,
            controlKind,
          );

        const question:
          DetectedQuestion = {
          id:
            buildQuestionId(
              control,
              index,
            ),

          label,

          normalizedLabel:
            normalize(
              label,
            ),

          category:
            classification.category,

          sensitivity:
            classification.sensitivity,

          controlKind,

          required:
            getRequiredState(
              control,
              label,
            ),

          answered:
            Boolean(
              currentValue,
            ),

          currentValue,

          options:
            getOptions(
              control,
            ),

          selectorHint:
            getSelectorHint(
              control,
            ),
        };

        mergeQuestion(
          questions,
          question,
        );
      },
    );

    const normalCount =
      questions.filter(
        (question) =>
          question.sensitivity ===
          "normal",
      ).length;

    const sensitiveCount =
      questions.filter(
        (question) =>
          question.sensitivity ===
          "sensitive",
      ).length;

    const answeredCount =
      questions.filter(
        (question) =>
          question.answered,
      ).length;

    return {
      url:
        window.location.href,

      title:
        document.title,

      scannedAt:
        new Date().toISOString(),

      questionCount:
        questions.length,

      normalCount,

      sensitiveCount,

      answeredCount,

      unansweredCount:
        questions.length -
        answeredCount,

      questions,
    };
  };