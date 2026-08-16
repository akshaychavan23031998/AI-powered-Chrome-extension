import {
  scanQuestions,
} from "../questions/question-detector";

import type {
  QuestionScanResult,
} from "../types/question";

import type {
  ValidationIssue,
  WorkdayValidationResult,
} from "../types/validation";

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

const canonicalLabel = (
  value:
    | string
    | undefined,
): string => {
  return normalize(
    value ?? "",
  )
    .replace(
      /\*/g,
      "",
    )
    .replace(
      /[:.]+$/g,
      "",
    )
    .trim();
};

const labelsMatch = (
  first:
    | string
    | undefined,

  second:
    | string
    | undefined,
): boolean => {
  const left =
    canonicalLabel(
      first,
    );

  const right =
    canonicalLabel(
      second,
    );

  if (
    !left ||
    !right
  ) {
    return false;
  }

  return (
    left === right ||
    left.includes(
      right,
    ) ||
    right.includes(
      left,
    )
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

const getAriaLabelledByText = (
  element: HTMLElement,
): string | undefined => {
  const labelledBy =
    element.getAttribute(
      "aria-labelledby",
    );

  if (
    !labelledBy
  ) {
    return undefined;
  }

  const text =
    labelledBy
      .split(/\s+/)
      .map((id) =>
        cleanText(
          document.getElementById(
            id,
          )?.textContent,
        ),
      )
      .filter(Boolean)
      .join(" ");

  return (
    text ||
    undefined
  );
};

const findNearbyRequiredLabel = (
  element: HTMLElement,
): string | undefined => {
  let current:
    HTMLElement | null =
      element.parentElement;

  for (
    let depth = 0;
    depth < 6 &&
    current;
    depth += 1
  ) {
    const labels =
      Array.from(
        current.querySelectorAll<
          HTMLElement
        >(
          [
            "label",
            "legend",
            "[data-automation-id*='label']",
            "[data-automation-id*='prompt']",
            "[role='heading']",
          ].join(","),
        ),
      );

    for (
      const candidate of
        labels
    ) {
      const text =
        cleanText(
          candidate.textContent,
        );

      if (
        !text ||
        text.length > 200
      ) {
        continue;
      }

      if (
        text.includes("*")
      ) {
        return text;
      }
    }

    current =
      current.parentElement;
  }

  return undefined;
};

const inferWorkdayFieldLabel = (
  element: HTMLElement,
): string | undefined => {
  const automationId =
    normalize(
      element.getAttribute(
        "data-automation-id",
      ) ?? "",
    );

  const placeholder =
    normalize(
      element.getAttribute(
        "placeholder",
      ) ?? "",
    );

  const name =
    normalize(
      element.getAttribute(
        "name",
      ) ?? "",
    );

  const id =
    normalize(
      element.id,
    );

  const combined = [
    automationId,
    placeholder,
    name,
    id,
  ].join(" ");

  if (
    combined.includes(
      "date",
    ) ||
    combined.includes(
      "mm/dd/yyyy",
    )
  ) {
    return "Date*";
  }

  if (
    combined.includes(
      "name",
    )
  ) {
    return "Name*";
  }

  return undefined;
};

const getElementLabel = (
  element: HTMLElement,
): string | undefined => {
  const ariaLabel =
    cleanText(
      element.getAttribute(
        "aria-label",
      ),
    );

  if (
    ariaLabel
  ) {
    return ariaLabel;
  }

  const labelledByText =
    getAriaLabelledByText(
      element,
    );

  if (
    labelledByText
  ) {
    return labelledByText;
  }

  if (
    element.id
  ) {
    const explicitLabel =
      document.querySelector<HTMLLabelElement>(
        `label[for="${CSS.escape(
          element.id,
        )}"]`,
      );

    const text =
      cleanText(
        explicitLabel?.textContent,
      );

    if (
      text
    ) {
      return text;
    }
  }

  const wrappingLabel =
    element.closest(
      "label",
    );

  const wrappingText =
    cleanText(
      wrappingLabel?.textContent,
    );

  if (
    wrappingText
  ) {
    return wrappingText;
  }

  const nearbyRequiredLabel =
    findNearbyRequiredLabel(
      element,
    );

  if (
    nearbyRequiredLabel
  ) {
    return nearbyRequiredLabel;
  }

  return inferWorkdayFieldLabel(
    element,
  );
};

const isPlaceholderValue = (
  value: string,
): boolean => {
  const text =
    normalize(
      value,
    );

  return (
    !text ||
    text ===
      "select one" ||
    text ===
      "please select one" ||
    text ===
      "0 items selected" ||
    text ===
      "mm/dd/yyyy" ||
    text ===
      "current value is mm/dd/yyyy" ||
    /^0\s+items?\s+selected/.test(
      text,
    )
  );
};

const findSelectedItemText = (
  element: HTMLElement,
): string | undefined => {
  let current:
    HTMLElement | null =
      element;

  for (
    let depth = 0;
    depth < 6 &&
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

const hasCheckedNativeRadio = (
  element: HTMLInputElement,
): boolean => {
  if (
    element.checked
  ) {
    return true;
  }

  if (
    !element.name
  ) {
    return false;
  }

  return Boolean(
    document.querySelector<HTMLInputElement>(
      `input[type="radio"][name="${CSS.escape(
        element.name,
      )}"]:checked`,
    ),
  );
};

const hasCheckedAriaChoice = (
  element: HTMLElement,
): boolean => {
  if (
    element.getAttribute(
      "aria-checked",
    ) === "true"
  ) {
    return true;
  }

  const directGroup =
    element.closest(
      "[role='radiogroup'], [role='group'], fieldset",
    );

  if (
    directGroup?.querySelector(
      [
        "[role='radio'][aria-checked='true']",
        "[role='checkbox'][aria-checked='true']",
        "input[type='radio']:checked",
        "input[type='checkbox']:checked",
      ].join(","),
    )
  ) {
    return true;
  }

  let current:
    HTMLElement | null =
      element.parentElement;

  for (
    let depth = 0;
    depth < 5 &&
    current;
    depth += 1
  ) {
    if (
      current.querySelector(
        [
          "[role='radio'][aria-checked='true']",
          "[role='checkbox'][aria-checked='true']",
          "input[type='radio']:checked",
          "input[type='checkbox']:checked",
        ].join(","),
      )
    ) {
      return true;
    }

    current =
      current.parentElement;
  }

  return false;
};

const nativeControlHasValue = (
  element:
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement,
): boolean => {
  if (
    element instanceof
      HTMLInputElement
  ) {
    if (
      element.type ===
        "hidden"
    ) {
      return false;
    }

    if (
      element.type ===
        "checkbox"
    ) {
      return element.checked;
    }

    if (
      element.type ===
        "radio"
    ) {
      return hasCheckedNativeRadio(
        element,
      );
    }

    return !isPlaceholderValue(
      element.value,
    );
  }

  if (
    element instanceof
      HTMLTextAreaElement
  ) {
    return !isPlaceholderValue(
      element.value,
    );
  }

  return !isPlaceholderValue(
    element.value,
  );
};

const descendantControlsHaveValue = (
  element: HTMLElement,
): boolean => {
  const controls =
    Array.from(
      element.querySelectorAll<
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
      >(
        "input, textarea, select",
      ),
    ).filter(
      (control) =>
        control.type !==
          "hidden" &&
        isVisible(
          control,
        ),
    );

  if (
    controls.length === 0
  ) {
    return false;
  }

  const nonChoiceControls =
    controls.filter(
      (control) =>
        !(
          control instanceof
            HTMLInputElement &&
          (
            control.type ===
              "radio" ||
            control.type ===
              "checkbox"
          )
        ),
    );

  if (
    nonChoiceControls.length >
    0
  ) {
    return nonChoiceControls.every(
      nativeControlHasValue,
    );
  }

  return controls.some(
    nativeControlHasValue,
  );
};

const hasExplicitAriaValue = (
  element: HTMLElement,
): boolean => {
  const candidates = [
    element.getAttribute(
      "aria-valuetext",
    ),
    element.getAttribute(
      "aria-value",
    ),
    element.getAttribute(
      "data-value",
    ),
  ];

  return candidates.some(
    (value) =>
      Boolean(
        value &&
          !isPlaceholderValue(
            value,
          ),
      ),
  );
};

const hasWorkdayRenderedValue = (
  element: HTMLElement,
): boolean => {
  let current:
    HTMLElement | null =
      element;

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

    const dateMatch =
      text.match(
        /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
      );

    if (
      dateMatch
    ) {
      return true;
    }

    current =
      current.parentElement;
  }

  return false;
};

const hasValue = (
  element: HTMLElement,
): boolean => {
  if (
    element instanceof
      HTMLInputElement
  ) {
    if (
      element.type ===
        "checkbox"
    ) {
      return (
        element.checked ||
        hasCheckedAriaChoice(
          element,
        )
      );
    }

    if (
      element.type ===
        "radio"
    ) {
      return (
        hasCheckedNativeRadio(
          element,
        ) ||
        hasCheckedAriaChoice(
          element,
        )
      );
    }

    if (
      nativeControlHasValue(
        element,
      )
    ) {
      return true;
    }
  }

  if (
    element instanceof
      HTMLTextAreaElement ||
    element instanceof
      HTMLSelectElement
  ) {
    if (
      nativeControlHasValue(
        element,
      )
    ) {
      return true;
    }
  }

  const role =
    element.getAttribute(
      "role",
    );

  if (
    role === "checkbox" ||
    role === "radio"
  ) {
    return hasCheckedAriaChoice(
      element,
    );
  }

  if (
    hasExplicitAriaValue(
      element,
    )
  ) {
    return true;
  }

  if (
    role === "combobox" ||
    element.getAttribute(
      "aria-haspopup",
    ) === "listbox"
  ) {
    if (
      findSelectedItemText(
        element,
      )
    ) {
      return true;
    }

    const ownText =
      cleanText(
        element.textContent,
      );

    if (
      ownText &&
      !isPlaceholderValue(
        ownText,
      )
    ) {
      return true;
    }
  }

  /*
   * Workday frequently applies aria-required to a wrapper
   * while the actual value lives inside a descendant input.
   */
  if (
    descendantControlsHaveValue(
      element,
    )
  ) {
    return true;
  }

  if (
    findSelectedItemText(
      element,
    )
  ) {
    return true;
  }

  /*
   * Workday date widgets can render the selected date as text
   * while keeping required metadata on an outer wrapper.
   */
  if (
    hasWorkdayRenderedValue(
      element,
    )
  ) {
    return true;
  }

  return false;
};

const isAnsweredQuestionLabel = (
  label:
    | string
    | undefined,

  questionScan:
    QuestionScanResult,
): boolean => {
  if (
    !label
  ) {
    return false;
  }

  return questionScan.questions.some(
    (question) =>
      question.answered &&
      labelsMatch(
        label,
        question.label,
      ),
  );
};

const collectInvalidFields =
  (): ValidationIssue[] => {
    const elements =
      Array.from(
        document.querySelectorAll<HTMLElement>(
          [
            "[aria-invalid='true']",
            "input:invalid",
            "textarea:invalid",
            "select:invalid",
          ].join(","),
        ),
      ).filter(
        isVisible,
      );

    return elements.map(
      (
        element,
        index,
      ) => ({
        id:
          `invalid-${index}`,

        type:
          "invalid",

        severity:
          "error",

        message:
          "Workday marked this field as invalid.",

        label:
          getElementLabel(
            element,
          ),

        selectorHint:
          getSelectorHint(
            element,
          ),
      }),
    );
  };

const findChoiceGroup = (
  element: HTMLElement,
): HTMLElement | undefined => {
  const directGroup =
    element.closest<HTMLElement>(
      "fieldset, [role='radiogroup'], [role='group']",
    );

  if (
    directGroup
  ) {
    return directGroup;
  }

  let current:
    HTMLElement | null =
      element.parentElement;

  for (
    let depth = 0;
    depth < 7 &&
    current;
    depth += 1
  ) {
    const text =
      normalize(
        current.textContent ??
          "",
      );

    const choiceCount =
      current.querySelectorAll(
        [
          "input[type='checkbox']",
          "input[type='radio']",
          "[role='checkbox']",
          "[role='radio']",
        ].join(","),
      ).length;

    if (
      choiceCount >= 2 &&
      (
        text.includes(
          "check one of the boxes",
        ) ||
        text.includes(
          "please check one",
        ) ||
        text.includes(
          "select one",
        )
      )
    ) {
      return current;
    }

    current =
      current.parentElement;
  }

  return undefined;
};

const choiceGroupHasValue = (
  group: HTMLElement,
): boolean => {
  return Boolean(
    group.querySelector(
      [
        "input[type='radio']:checked",
        "input[type='checkbox']:checked",
        "[role='radio'][aria-checked='true']",
        "[role='checkbox'][aria-checked='true']",
      ].join(","),
    ),
  );
};

const getChoiceGroupLabel = (
  group: HTMLElement,
): string | undefined => {
  const legend =
    cleanText(
      group.querySelector(
        "legend",
      )?.textContent,
    );

  if (
    legend
  ) {
    return legend;
  }

  const labelledBy =
    getAriaLabelledByText(
      group,
    );

  if (
    labelledBy
  ) {
    return labelledBy;
  }

  const text =
    cleanText(
      group.textContent,
    );

  const disabilityPrompt =
    text.match(
      /please check one of the boxes below:?\*?/i,
    );

  if (
    disabilityPrompt
  ) {
    return cleanText(
      disabilityPrompt[0],
    );
  }

  return undefined;
};

const collectRequiredFields = (
  questionScan:
    QuestionScanResult,
): ValidationIssue[] => {
  const candidates =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        [
          "[required]",
          "[aria-required='true']",
        ].join(","),
      ),
    ).filter(
      isVisible,
    );

  const issues:
    ValidationIssue[] = [];

  const processedRadioNames =
    new Set<string>();

  const processedGroups =
    new Set<HTMLElement>();

  for (
    const element of
      candidates
  ) {
    const label =
      getElementLabel(
        element,
      );

    if (
      isAnsweredQuestionLabel(
        label,
        questionScan,
      )
    ) {
      continue;
    }

    if (
      element instanceof
        HTMLInputElement &&
      element.type ===
        "radio" &&
      element.name
    ) {
      if (
        processedRadioNames.has(
          element.name,
        )
      ) {
        continue;
      }

      processedRadioNames.add(
        element.name,
      );
    }

    const role =
      element.getAttribute(
        "role",
      );

    const isChoice =
      (
        element instanceof
          HTMLInputElement &&
        (
          element.type ===
            "radio" ||
          element.type ===
            "checkbox"
        )
      ) ||
      role === "radio" ||
      role === "checkbox";

    if (
      isChoice
    ) {
      const group =
        findChoiceGroup(
          element,
        );

      if (
        group
      ) {
        if (
          processedGroups.has(
            group,
          )
        ) {
          continue;
        }

        processedGroups.add(
          group,
        );

        if (
          choiceGroupHasValue(
            group,
          )
        ) {
          continue;
        }

        issues.push({
          id:
            `required-group-${issues.length}`,

          type:
            "required",

          severity:
            "error",

          message:
            "A required choice has not been selected.",

          label:
            getChoiceGroupLabel(
              group,
            ) ??
            label,

          selectorHint:
            getSelectorHint(
              element,
            ),
        });

        continue;
      }
    }

    if (
      hasValue(
        element,
      )
    ) {
      continue;
    }

    issues.push({
      id:
        `required-${issues.length}`,

      type:
        "required",

      severity:
        "error",

      message:
        "Required field does not appear to have a value.",

      label,

      selectorHint:
        getSelectorHint(
          element,
        ),
    });
  }

  return issues;
};

const looksLikeSectionHeading = (
  label: string,
): boolean => {
  const value =
    normalize(
      label,
    );

  return (
    value ===
      "voluntary self-identification of disability" ||
    value ===
      "terms and conditions" ||
    value ===
      "voluntary disclosures" ||
    value ===
      "self identify" ||
    value ===
      "self-identify"
  );
};

const collectRequiredQuestions = (
  questionScan:
    QuestionScanResult,
): ValidationIssue[] => {
  return questionScan.questions
    .filter(
      (question) => {
        if (
          !question.required ||
          question.answered
        ) {
          return false;
        }

        if (
          question.controlKind ===
            "radio" ||
          question.controlKind ===
            "checkbox"
        ) {
          return false;
        }

        if (
          question.category ===
          "custom"
        ) {
          return false;
        }

        if (
          looksLikeSectionHeading(
            question.label,
          )
        ) {
          return false;
        }

        return true;
      },
    )
    .map(
      (
        question,
        index,
      ) => ({
        id:
          `question-required-${index}`,

        type:
          "unanswered",

        severity:
          "error",

        message:
          question.sensitivity ===
            "sensitive"
            ? "Required sensitive question needs explicit user input."
            : "Required application question has not been answered.",

        label:
          question.label,

        selectorHint:
          question.selectorHint,
      }),
    );
};

const collectPageErrors =
  (): ValidationIssue[] => {
    const selectors = [
      "[role='alert']",
      "[aria-live='assertive']",
      "[data-automation-id*='error']",
      "[data-automation-id*='validation']",
      ".error",
      ".error-message",
      ".validation-error",
    ];

    const seen =
      new Set<string>();

    const issues:
      ValidationIssue[] = [];

    for (
      const selector of
        selectors
    ) {
      const elements =
        Array.from(
          document.querySelectorAll<HTMLElement>(
            selector,
          ),
        ).filter(
          isVisible,
        );

      for (
        const element of
          elements
      ) {
        const message =
          cleanText(
            element.textContent,
          );

        if (
          !message ||
          message.length >
            500
        ) {
          continue;
        }

        const key =
          message.toLowerCase();

        if (
          seen.has(
            key,
          )
        ) {
          continue;
        }

        seen.add(
          key,
        );

        issues.push({
          id:
            `page-error-${issues.length}`,

          type:
            "page-error",

          severity:
            "error",

          message,
        });
      }
    }

    return issues;
  };

const dedupeIssues = (
  issues:
    ValidationIssue[],
): ValidationIssue[] => {
  const result:
    ValidationIssue[] = [];

  for (
    const issue of
      issues
  ) {
    const duplicate =
      result.some(
        (existing) => {
          if (
            issue.selectorHint &&
            existing.selectorHint &&
            issue.selectorHint ===
              existing.selectorHint
          ) {
            return true;
          }

          if (
            labelsMatch(
              issue.label,
              existing.label,
            )
          ) {
            return true;
          }

          return false;
        },
      );

    if (
      !duplicate
    ) {
      result.push(
        issue,
      );
    }
  }

  return result;
};

const safelyScanQuestions =
  (): QuestionScanResult => {
    try {
      return scanQuestions();
    } catch {
      return {
        url:
          window.location.href,

        title:
          document.title,

        scannedAt:
          new Date().toISOString(),

        questionCount:
          0,

        normalCount:
          0,

        sensitiveCount:
          0,

        answeredCount:
          0,

        unansweredCount:
          0,

        questions: [],
      };
    }
  };

export const validateWorkdayPage =
  (): WorkdayValidationResult => {
    const questionScan =
      safelyScanQuestions();

    const issues =
      dedupeIssues([
        ...collectInvalidFields(),

        ...collectRequiredFields(
          questionScan,
        ),

        ...collectRequiredQuestions(
          questionScan,
        ),

        ...collectPageErrors(),
      ]);

    const errorCount =
      issues.filter(
        (issue) =>
          issue.severity ===
          "error",
      ).length;

    const warningCount =
      issues.filter(
        (issue) =>
          issue.severity ===
          "warning",
      ).length;

    const result:
      WorkdayValidationResult = {
      url:
        window.location.href,

      title:
        document.title,

      scannedAt:
        new Date().toISOString(),

      valid:
        errorCount === 0,

      errorCount,

      warningCount,

      issues,
    };

    console.log(
      "Workday validation completed:",
      result,
    );

    return result;
  };