import type {
  DetectedQuestion,
  QuestionAnswerProfile,
  QuestionAutofillResult,
  QuestionFillItemResult,
  SavedQuestionAnswer,
} from "../types/question";

import {
  scanQuestions,
} from "./question-detector";

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

const findSavedAnswer = (
  question:
    DetectedQuestion,

  profile:
    QuestionAnswerProfile,
): SavedQuestionAnswer | undefined => {
  const exactLabel =
    profile.answers.find(
      (answer) =>
        answer.explicitUserAnswer &&
        answer.questionLabel &&
        normalize(
          answer.questionLabel,
        ) ===
          question.normalizedLabel,
    );

  if (
    exactLabel
  ) {
    return exactLabel;
  }

  /*
   * Sensitive answers are intentionally NOT
   * matched generically by category.
   *
   * Gender/race/veteran/disability questions
   * must have an explicit question-specific
   * answer to avoid applying one sensitive
   * answer to another sensitive question.
   */
  if (
    question.sensitivity ===
      "sensitive"
  ) {
    return undefined;
  }

  return profile.answers.find(
    (answer) =>
      answer.explicitUserAnswer &&
      answer.category ===
        question.category,
  );
};

const findElement = (
  question:
    DetectedQuestion,
): HTMLElement | undefined => {
  if (
    question.selectorHint
  ) {
    try {
      const element =
        document.querySelector<HTMLElement>(
          question.selectorHint,
        );

      if (
        element
      ) {
        return element;
      }
    } catch {
      // Ignore invalid selector hints.
    }
  }

  if (
    question.id
  ) {
    const element =
      document.getElementById(
        question.id,
      );

    if (
      element
    ) {
      return element;
    }
  }

  return undefined;
};

const dispatchValueEvents = (
  element:
    HTMLElement,
): void => {
  element.dispatchEvent(
    new Event(
      "input",
      {
        bubbles: true,
      },
    ),
  );

  element.dispatchEvent(
    new Event(
      "change",
      {
        bubbles: true,
      },
    ),
  );

  element.dispatchEvent(
    new Event(
      "blur",
      {
        bubbles: true,
      },
    ),
  );
};

const fillTextControl = (
  element:
    HTMLInputElement |
    HTMLTextAreaElement,

  value:
    string,
): boolean => {
  if (
    cleanText(
      element.value,
    )
  ) {
    return false;
  }

  const prototype =
    element instanceof
      HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;

  const descriptor =
    Object.getOwnPropertyDescriptor(
      prototype,
      "value",
    );

  descriptor?.set?.call(
    element,
    value,
  );

  dispatchValueEvents(
    element,
  );

  return (
    cleanText(
      element.value,
    ) ===
    cleanText(
      value,
    )
  );
};

const fillSelect = (
  element:
    HTMLSelectElement,

  value:
    string,
): boolean => {
  const target =
    normalize(
      value,
    );

  const option =
    Array.from(
      element.options,
    ).find(
      (candidate) =>
        normalize(
          candidate.value,
        ) ===
          target ||
        normalize(
          candidate.textContent ??
            "",
        ) ===
          target,
    );

  if (!option) {
    return false;
  }

  element.value =
    option.value;

  dispatchValueEvents(
    element,
  );

  return (
    element.value ===
    option.value
  );
};

const findRadioGroup = (
  element:
    HTMLInputElement,
): HTMLInputElement[] => {
  if (
    !element.name
  ) {
    return [
      element,
    ];
  }

  return Array.from(
    document.querySelectorAll<HTMLInputElement>(
      `input[type="radio"][name="${CSS.escape(
        element.name,
      )}"]`,
    ),
  );
};

const getRadioLabel = (
  radio:
    HTMLInputElement,
): string => {
  if (
    radio.id
  ) {
    const label =
      document.querySelector(
        `label[for="${CSS.escape(
          radio.id,
        )}"]`,
      );

    if (
      label
    ) {
      return cleanText(
        label.textContent,
      );
    }
  }

  return cleanText(
    radio.parentElement
      ?.textContent,
  );
};

const fillRadio = (
  element:
    HTMLInputElement,

  value:
    string,
): boolean => {
  const target =
    normalize(
      value,
    );

  const radios =
    findRadioGroup(
      element,
    );

  const match =
    radios.find(
      (radio) => {
        const radioValue =
          normalize(
            radio.value,
          );

        const labelText =
          normalize(
            getRadioLabel(
              radio,
            ),
          );

        return (
          radioValue ===
            target ||
          labelText ===
            target ||
          labelText.includes(
            target,
          )
        );
      },
    );

  if (!match) {
    return false;
  }

  if (
    !match.checked
  ) {
    match.click();
  }

  return match.checked;
};

const fillCheckbox = (
  element:
    HTMLInputElement,

  value:
    string,
): boolean => {
  const normalizedValue =
    normalize(
      value,
    );

  const shouldCheck =
    [
      "yes",
      "true",
      "checked",
      "agree",
      "accepted",
    ].includes(
      normalizedValue,
    );

  if (
    element.checked !==
      shouldCheck
  ) {
    element.click();
  }

  return (
    element.checked ===
    shouldCheck
  );
};

const fillQuestion = (
  question:
    DetectedQuestion,

  answer:
    SavedQuestionAnswer,
): QuestionFillItemResult => {
  if (
    !answer.explicitUserAnswer
  ) {
    return {
      questionId:
        question.id,

      label:
        question.label,

      category:
        question.category,

      status:
        "manualReview",

      reason:
        "Answer was not explicitly provided by the user.",
    };
  }

  if (
    question.answered
  ) {
    return {
      questionId:
        question.id,

      label:
        question.label,

      category:
        question.category,

      status:
        "skipped",

      reason:
        "Existing Workday answer preserved.",
    };
  }

  const element =
    findElement(
      question,
    );

  if (
    !element
  ) {
    return {
      questionId:
        question.id,

      label:
        question.label,

      category:
        question.category,

      status:
        "failed",

      value:
        answer.value,

      reason:
        "Question control could not be located.",
    };
  }

  let filled =
    false;

  if (
    element instanceof
      HTMLInputElement
  ) {
    if (
      element.type ===
        "radio"
    ) {
      filled =
        fillRadio(
          element,
          answer.value,
        );
    } else if (
      element.type ===
        "checkbox"
    ) {
      filled =
        fillCheckbox(
          element,
          answer.value,
        );
    } else if (
      element.type ===
        "text" ||
      element.type ===
        "email" ||
      element.type ===
        "tel" ||
      element.type ===
        "number"
    ) {
      filled =
        fillTextControl(
          element,
          answer.value,
        );
    }
  } else if (
    element instanceof
      HTMLTextAreaElement
  ) {
    filled =
      fillTextControl(
        element,
        answer.value,
      );
  } else if (
    element instanceof
      HTMLSelectElement
  ) {
    filled =
      fillSelect(
        element,
        answer.value,
      );
  }

  return {
    questionId:
      question.id,

    label:
      question.label,

    category:
      question.category,

    status:
      filled
        ? "filled"
        : "manualReview",

    value:
      answer.value,

    reason:
      filled
        ? undefined
        : "This Workday control requires manual selection or unsupported combobox interaction.",
  };
};

export const autofillQuestions =
  (
    profile:
      QuestionAnswerProfile,
  ): QuestionAutofillResult => {
    const initialScan =
      scanQuestions();

    const results:
      QuestionFillItemResult[] =
      [];

    for (
      const question of
        initialScan.questions
    ) {
      const answer =
        findSavedAnswer(
          question,
          profile,
        );

      if (
        !answer
      ) {
        results.push({
          questionId:
            question.id,

          label:
            question.label,

          category:
            question.category,

          status:
            "manualReview",

          reason:
            question.sensitivity ===
              "sensitive"
              ? "Sensitive or voluntary question requires an explicit user answer."
              : "No explicit saved answer is available.",
        });

        continue;
      }

      results.push(
        fillQuestion(
          question,
          answer,
        ),
      );
    }

    const scan =
      scanQuestions();

    return {
      attemptedCount:
        results.length,

      filledCount:
        results.filter(
          (result) =>
            result.status ===
            "filled",
        ).length,

      skippedCount:
        results.filter(
          (result) =>
            result.status ===
            "skipped",
        ).length,

      failedCount:
        results.filter(
          (result) =>
            result.status ===
            "failed",
        ).length,

      manualReviewCount:
        results.filter(
          (result) =>
            result.status ===
            "manualReview",
        ).length,

      results,

      scan,
    };
  };