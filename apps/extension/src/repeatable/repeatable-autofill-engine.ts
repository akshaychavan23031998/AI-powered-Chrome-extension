import type {
  CandidateEducation,
  CandidateExperience,
  CandidateProfile,
} from "../types/candidate";

import type {
  RepeatableAutofillResult,
  RepeatableFieldFillResult,
} from "../types/repeatable-fill";

import {
  addRepeatableEntry,
} from "./repeatable-section-manager";

import {
  scanRepeatableSections,
} from "./repeatable-section-detector";

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

const formatExperienceDate = (
  value:
    | string
    | undefined,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const match =
    value.match(
      /^(\d{4})-(\d{2})$/,
    );

  if (!match) {
    return value;
  }

  const [, year, month] =
    match;

  return `${month}/${year}`;
};

const formatEducationYear = (
  value:
    | string
    | undefined,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const match =
    value.match(
      /^(\d{4})/,
    );

  return (
    match?.[1] ??
    value
  );
};

const normalizeGrade = (
  value:
    | string
    | undefined,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const numeric =
    value.match(
      /(\d+(?:\.\d+)?)/,
    );

  return (
    numeric?.[1] ??
    value
  );
};

const setNativeInputValue = (
  element:
    HTMLInputElement |
    HTMLTextAreaElement,
  value: string,
): void => {
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

const setCheckboxValue = (
  element:
    HTMLInputElement,
  checked: boolean,
): void => {
  if (
    element.checked ===
    checked
  ) {
    return;
  }

  const descriptor =
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "checked",
    );

  descriptor?.set?.call(
    element,
    checked,
  );

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

  element.click();
};

const findEntryHeading = (
  pattern: RegExp,
): HTMLElement | undefined => {
  const candidates =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "[role='heading']",
          "div",
          "span",
          "p",
        ].join(","),
      ),
    );

  return candidates.find(
    (element) =>
      isVisible(
        element,
      ) &&
      pattern.test(
        cleanText(
          element.textContent,
        ),
      ),
  );
};

const findEntryContainer = (
  heading:
    HTMLElement,
  expectedLabels:
    string[],
): HTMLElement => {
  let current:
    HTMLElement | null =
    heading;

  for (
    let depth = 0;
    depth < 10 &&
    current;
    depth += 1
  ) {
    const text =
      normalize(
        current.textContent ??
          "",
      );

    const labelMatches =
      expectedLabels.filter(
        (label) =>
          text.includes(
            normalize(
              label,
            ),
          ),
      ).length;

    if (
      labelMatches >=
      Math.min(
        2,
        expectedLabels.length,
      )
    ) {
      return current;
    }

    current =
      current.parentElement;
  }

  return (
    heading.parentElement ??
    heading
  );
};

const getLabelText = (
  element:
    HTMLInputElement |
    HTMLTextAreaElement |
    HTMLSelectElement,
): string => {
  const pieces:
    string[] = [];

  if (element.id) {
    const label =
      document.querySelector(
        `label[for="${CSS.escape(
          element.id,
        )}"]`,
      );

    if (label) {
      pieces.push(
        cleanText(
          label.textContent,
        ),
      );
    }
  }

  const ariaLabel =
    element.getAttribute(
      "aria-label",
    );

  if (ariaLabel) {
    pieces.push(
      ariaLabel,
    );
  }

  const labelledBy =
    element.getAttribute(
      "aria-labelledby",
    );

  if (labelledBy) {
    for (
      const id of
        labelledBy.split(
          /\s+/,
        )
    ) {
      const label =
        document.getElementById(
          id,
        );

      if (label) {
        pieces.push(
          cleanText(
            label.textContent,
          ),
        );
      }
    }
  }

  const parent =
    element.parentElement;

  if (parent) {
    pieces.push(
      cleanText(
        parent.textContent,
      ),
    );
  }

  return cleanText(
    pieces.join(
      " ",
    ),
  );
};

const findInputByLabel = (
  container:
    HTMLElement,
  label:
    string,
):
  | HTMLInputElement
  | HTMLTextAreaElement
  | undefined => {
  const target =
    normalize(label);

  const candidates =
    Array.from(
      container.querySelectorAll<
        HTMLInputElement |
        HTMLTextAreaElement
      >(
        [
          "input:not([type='hidden'])",
          "textarea",
        ].join(","),
      ),
    );

  return candidates.find(
    (candidate) => {
      if (
        !isVisible(
          candidate,
        )
      ) {
        return false;
      }

      const fieldLabel =
        normalize(
          getLabelText(
            candidate,
          ),
        );

      return fieldLabel.includes(
        target,
      );
    },
  );
};

const findCheckboxByLabel = (
  container:
    HTMLElement,
  label:
    string,
): HTMLInputElement | undefined => {
  const target =
    normalize(label);

  const candidates =
    Array.from(
      container.querySelectorAll<HTMLInputElement>(
        "input[type='checkbox']",
      ),
    );

  return candidates.find(
    (candidate) => {
      const fieldLabel =
        normalize(
          getLabelText(
            candidate,
          ),
        );

      return fieldLabel.includes(
        target,
      );
    },
  );
};

const recordTextFill = (
  results:
    RepeatableFieldFillResult[],
  section:
    string,
  field:
    string,
  element:
    | HTMLInputElement
    | HTMLTextAreaElement
    | undefined,
  value:
    | string
    | undefined,
): void => {
  if (!value) {
    results.push({
      section,
      field,
      status: "skipped",
      reason:
        "Candidate value is empty.",
    });

    return;
  }

  if (!element) {
    results.push({
      section,
      field,
      value,
      status: "failed",
      reason:
        "Workday field was not found.",
    });

    return;
  }

  if (
    element.disabled ||
    element.readOnly
  ) {
    results.push({
      section,
      field,
      value,
      status: "skipped",
      reason:
        "Workday field is disabled or read-only.",
    });

    return;
  }

  const existingValue =
    cleanText(
      element.value,
    );

  if (existingValue) {
    results.push({
      section,
      field,
      value:
        existingValue,
      status: "skipped",
      reason:
        "Existing Workday value preserved.",
    });

    return;
  }

  setNativeInputValue(
    element,
    value,
  );

  const actualValue =
    cleanText(
      element.value,
    );

  if (
    actualValue ===
    cleanText(value)
  ) {
    results.push({
      section,
      field,
      value,
      status: "filled",
    });

    return;
  }

  results.push({
    section,
    field,
    value,
    status: "failed",
    reason:
      "Value could not be verified after filling.",
  });
};

const fillExperienceEntry = (
  experience:
    CandidateExperience,
  index:
    number,
  results:
    RepeatableFieldFillResult[],
): void => {
  const number =
    index + 1;

  const section =
    `Work Experience ${number}`;

  const heading =
    findEntryHeading(
      new RegExp(
        `^work experience\\s+${number}$`,
        "i",
      ),
    );

  if (!heading) {
    results.push({
      section,
      field: "section",
      status: "failed",
      reason:
        "Work Experience section heading was not found.",
    });

    return;
  }

  const container =
    findEntryContainer(
      heading,
      [
        "Job Title",
        "Company",
        "Location",
        "Role Description",
      ],
    );

  recordTextFill(
    results,
    section,
    "Job Title",
    findInputByLabel(
      container,
      "Job Title",
    ),
    experience.title,
  );

  recordTextFill(
    results,
    section,
    "Company",
    findInputByLabel(
      container,
      "Company",
    ),
    experience.company,
  );

  recordTextFill(
    results,
    section,
    "Location",
    findInputByLabel(
      container,
      "Location",
    ),
    experience.location,
  );

  recordTextFill(
    results,
    section,
    "From",
    findInputByLabel(
      container,
      "From",
    ),
    formatExperienceDate(
      experience.startDate,
    ),
  );

  if (
    !experience.current
  ) {
    recordTextFill(
      results,
      section,
      "To",
      findInputByLabel(
        container,
        "To",
      ),
      formatExperienceDate(
        experience.endDate,
      ),
    );
  }

  recordTextFill(
    results,
    section,
    "Role Description",
    findInputByLabel(
      container,
      "Role Description",
    ),
    experience.description,
  );

  const currentCheckbox =
    findCheckboxByLabel(
      container,
      "currently work here",
    );

  if (
    currentCheckbox &&
    typeof experience.current ===
      "boolean"
  ) {
    const desired =
      experience.current;

    if (
      currentCheckbox.checked ===
      desired
    ) {
      results.push({
        section,
        field:
          "I currently work here",
        value:
          String(desired),
        status:
          "skipped",
        reason:
          "Checkbox already has the expected value.",
      });
    } else {
      setCheckboxValue(
        currentCheckbox,
        desired,
      );

      results.push({
        section,
        field:
          "I currently work here",
        value:
          String(desired),
        status:
          currentCheckbox.checked ===
          desired
            ? "filled"
            : "failed",
        reason:
          currentCheckbox.checked ===
          desired
            ? undefined
            : "Checkbox value could not be verified.",
      });
    }
  }
};

const fillEducationEntry = (
  education:
    CandidateEducation,
  index:
    number,
  results:
    RepeatableFieldFillResult[],
): void => {
  const number =
    index + 1;

  const section =
    `Education ${number}`;

  const heading =
    findEntryHeading(
      new RegExp(
        `^education\\s+${number}$`,
        "i",
      ),
    );

  if (!heading) {
    results.push({
      section,
      field: "section",
      status: "failed",
      reason:
        "Education section heading was not found.",
    });

    return;
  }

  const container =
    findEntryContainer(
      heading,
      [
        "School or University",
        "Degree",
        "Field of Study",
        "Overall Result",
      ],
    );

  recordTextFill(
    results,
    section,
    "School or University",
    findInputByLabel(
      container,
      "School or University",
    ),
    education.institution,
  );

  /*
   * Workday Degree is commonly a combobox.
   * We deliberately do not type arbitrary text
   * into it until the combobox option interaction
   * is handled reliably.
   */
  const degreeInput =
    findInputByLabel(
      container,
      "Degree",
    );

  if (
    degreeInput &&
    degreeInput.tagName.toLowerCase() ===
      "input"
  ) {
    recordTextFill(
      results,
      section,
      "Degree",
      degreeInput,
      education.degree,
    );
  } else {
    results.push({
      section,
      field: "Degree",
      value:
        education.degree,
      status: "skipped",
      reason:
        "Degree appears to be a Workday dropdown and requires option selection.",
    });
  }

  const fieldOfStudyInput =
    findInputByLabel(
      container,
      "Field of Study",
    );

  if (
    fieldOfStudyInput
  ) {
    recordTextFill(
      results,
      section,
      "Field of Study",
      fieldOfStudyInput,
      education.fieldOfStudy,
    );
  } else {
    results.push({
      section,
      field:
        "Field of Study",
      value:
        education.fieldOfStudy,
      status: "skipped",
      reason:
        "Field of Study appears to be a Workday combobox.",
    });
  }

  recordTextFill(
    results,
    section,
    "Overall Result",
    findInputByLabel(
      container,
      "Overall Result",
    ),
    normalizeGrade(
      education.grade,
    ),
  );

  recordTextFill(
    results,
    section,
    "From",
    findInputByLabel(
      container,
      "From",
    ),
    formatEducationYear(
      education.startDate,
    ),
  );

  recordTextFill(
    results,
    section,
    "To",
    findInputByLabel(
      container,
      "To",
    ),
    formatEducationYear(
      education.endDate,
    ),
  );
};

const ensureEntryCount = async (
  kind:
    "workExperience" |
    "education",
  desiredCount:
    number,
): Promise<void> => {
  for (
    let attempt = 0;
    attempt < desiredCount + 2;
    attempt += 1
  ) {
    const scan =
      scanRepeatableSections();

    const currentCount =
      scan.sections.find(
        (section) =>
          section.kind ===
          kind,
      )?.entryCount ?? 0;

    if (
      currentCount >=
      desiredCount
    ) {
      return;
    }

    const result =
      await addRepeatableEntry(
        kind,
      );

    if (
      !result.added
    ) {
      throw new Error(
        `Unable to create ${kind} entry: ${result.reason}`,
      );
    }

    await sleep(
      300,
    );
  }
};

export const autofillRepeatableSections =
  async (
    candidate:
      CandidateProfile,
  ): Promise<RepeatableAutofillResult> => {
    const experiences =
      candidate.experience ??
      [];

    const education =
      candidate.education ??
      [];

    if (
      experiences.length === 0 &&
      education.length === 0
    ) {
      return {
        attemptedCount: 0,
        filledCount: 0,
        skippedCount: 0,
        failedCount: 0,
        experienceCount: 0,
        educationCount: 0,
        results: [],
      };
    }

    if (
      experiences.length > 0
    ) {
      await ensureEntryCount(
        "workExperience",
        experiences.length,
      );
    }

    if (
      education.length > 0
    ) {
      await ensureEntryCount(
        "education",
        education.length,
      );
    }

    await sleep(
      400,
    );

    const results:
      RepeatableFieldFillResult[] =
      [];

    experiences.forEach(
      (
        experience,
        index,
      ) => {
        fillExperienceEntry(
          experience,
          index,
          results,
        );
      },
    );

    education.forEach(
      (
        item,
        index,
      ) => {
        fillEducationEntry(
          item,
          index,
          results,
        );
      },
    );

    const filledCount =
      results.filter(
        (result) =>
          result.status ===
          "filled",
      ).length;

    const skippedCount =
      results.filter(
        (result) =>
          result.status ===
          "skipped",
      ).length;

    const failedCount =
      results.filter(
        (result) =>
          result.status ===
          "failed",
      ).length;

    return {
      attemptedCount:
        results.length,

      filledCount,

      skippedCount,

      failedCount,

      experienceCount:
        experiences.length,

      educationCount:
        education.length,

      results,
    };
  };