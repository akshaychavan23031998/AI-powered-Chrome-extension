import {
  querySelectorAllDeep,
} from "../scanner/shadow-dom";

import type {
  DynamicSectionScanResult,
  RepeatableSectionDescriptor,
  RepeatableSectionKind,
} from "../types/repeatable";

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

const getElementText = (
  element: Element,
): string => {
  return cleanText(
    element.getAttribute(
      "aria-label",
    ) ??
      element.textContent,
  );
};

const getSectionTitle = (
  kind:
    RepeatableSectionKind,
): string => {
  switch (kind) {
    case "workExperience":
      return "Work Experience";

    case "education":
      return "Education";

    case "websites":
      return "Websites";

    default:
      return "Unknown";
  }
};

const inferSectionKindFromText = (
  text: string,
): RepeatableSectionKind => {
  const value =
    normalize(text);

  if (
    value ===
      "work experience"
  ) {
    return "workExperience";
  }

  if (
    value ===
      "education"
  ) {
    return "education";
  }

  if (
    value ===
      "website" ||
    value ===
      "websites"
  ) {
    return "websites";
  }

  return "unknown";
};

const buildSelectorHint = (
  element:
    HTMLElement,
): string | undefined => {
  if (element.id) {
    return `#${CSS.escape(
      element.id,
    )}`;
  }

  const automationId =
    element.getAttribute(
      "data-automation-id",
    );

  if (automationId) {
    return `[data-automation-id="${automationId}"]`;
  }

  return undefined;
};

const isVisible = (
  element:
    HTMLElement,
): boolean => {
  const style =
    window.getComputedStyle(
      element,
    );

  if (
    style.display ===
      "none" ||
    style.visibility ===
      "hidden"
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

const isAddButton = (
  element: Element,
): element is HTMLElement => {
  if (
    !(
      element instanceof
      HTMLElement
    )
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

  const text =
    normalize(
      getElementText(
        element,
      ),
    );

  return (
    text === "add" ||
    text === "add another"
  );
};

const TEXT_ELEMENT_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "[role='heading']",
  "legend",
  "div",
  "span",
  "p",
].join(",");

const getTextElements =
  (): HTMLElement[] => {
    return querySelectorAllDeep(
      TEXT_ELEMENT_SELECTOR,
    ).filter(
      (
        element,
      ): element is HTMLElement =>
        element instanceof
          HTMLElement &&
        isVisible(
          element,
        ),
    );
  };

const getSectionLabels =
  (): Array<{
    element:
      HTMLElement;

    kind:
      RepeatableSectionKind;
  }> => {
    const labels:
      Array<{
        element:
          HTMLElement;

        kind:
          RepeatableSectionKind;
      }> = [];

    for (
      const element of
        getTextElements()
    ) {
      const kind =
        inferSectionKindFromText(
          getElementText(
            element,
          ),
        );

      if (
        kind ===
        "unknown"
      ) {
        continue;
      }

      labels.push({
        element,
        kind,
      });
    }

    return labels;
  };

const isElementBefore = (
  first:
    HTMLElement,
  second:
    HTMLElement,
): boolean => {
  const position =
    first.compareDocumentPosition(
      second,
    );

  return Boolean(
    position &
      Node.DOCUMENT_POSITION_FOLLOWING,
  );
};

const findNearestSectionLabelBefore =
  (
    button:
      HTMLElement,
  ):
    | {
        element:
          HTMLElement;

        kind:
          RepeatableSectionKind;
      }
    | undefined => {
    const labels =
      getSectionLabels();

    let nearest:
      | {
          element:
            HTMLElement;

          kind:
            RepeatableSectionKind;
        }
      | undefined;

    for (
      const label of labels
    ) {
      if (
        !isElementBefore(
          label.element,
          button,
        )
      ) {
        continue;
      }

      if (!nearest) {
        nearest =
          label;

        continue;
      }

      if (
        isElementBefore(
          nearest.element,
          label.element,
        )
      ) {
        nearest =
          label;
      }
    }

    return nearest;
  };

const inferKindFromNearbyContainer =
  (
    button:
      HTMLElement,
  ): RepeatableSectionKind => {
    let current:
      HTMLElement | null =
      button.parentElement;

    for (
      let depth = 0;
      depth < 8 &&
      current;
      depth += 1
    ) {
      const children =
        Array.from(
          current.querySelectorAll(
            TEXT_ELEMENT_SELECTOR,
          ),
        );

      for (
        const child of
          children
      ) {
        const kind =
          inferSectionKindFromText(
            getElementText(
              child,
            ),
          );

        if (
          kind !==
          "unknown"
        ) {
          return kind;
        }
      }

      current =
        current.parentElement;
    }

    return "unknown";
  };

const inferKindForButton = (
  button:
    HTMLElement,
): RepeatableSectionKind => {
  const nearbyKind =
    inferKindFromNearbyContainer(
      button,
    );

  if (
    nearbyKind !==
    "unknown"
  ) {
    return nearbyKind;
  }

  const previousLabel =
    findNearestSectionLabelBefore(
      button,
    );

  return (
    previousLabel?.kind ??
    "unknown"
  );
};

const ENTRY_TEXT_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "[role='heading']",
  "legend",
  "div",
  "span",
  "p",
].join(",");

const getEntryPattern = (
  kind:
    RepeatableSectionKind,
): RegExp | undefined => {
  switch (kind) {
    case "workExperience":
      return /^work experience\s+\d+$/i;

    case "education":
      return /^education\s+\d+$/i;

    case "websites":
      return /^websites?\s+\d+$/i;

    default:
      return undefined;
  }
};

const countEntries = (
  kind:
    RepeatableSectionKind,
): number => {
  const pattern =
    getEntryPattern(
      kind,
    );

  if (!pattern) {
    return 0;
  }

  const matches =
    querySelectorAllDeep(
      ENTRY_TEXT_SELECTOR,
    ).filter((element) => {
      if (
        !(
          element instanceof
          HTMLElement
        )
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

      return pattern.test(
        getElementText(
          element,
        ),
      );
    });

  /*
   * Workday may render the same visible text
   * through nested wrappers.
   *
   * Count unique entry numbers instead of
   * simply counting matching DOM nodes.
   */
  const uniqueEntries =
    new Set<string>();

  for (
    const element of matches
  ) {
    uniqueEntries.add(
      normalize(
        getElementText(
          element,
        ),
      ),
    );
  }

  return uniqueEntries.size;
};

const hasSectionLabel = (
  kind:
    RepeatableSectionKind,
): boolean => {
  return getSectionLabels().some(
    (candidate) =>
      candidate.kind ===
      kind,
  );
};

export const findAddAnotherButton = (
  kind:
    RepeatableSectionKind,
): HTMLElement | undefined => {
  const candidates =
    querySelectorAllDeep(
      [
        "button",
        "[role='button']",
      ].join(","),
    );

  for (
    const candidate of
      candidates
  ) {
    if (
      !isAddButton(
        candidate,
      )
    ) {
      continue;
    }

    const detectedKind =
      inferKindForButton(
        candidate,
      );

    if (
      detectedKind ===
      kind
    ) {
      return candidate;
    }
  }

  return undefined;
};

export const scanRepeatableSections =
  (): DynamicSectionScanResult => {
    const kinds:
      RepeatableSectionKind[] =
      [
        "workExperience",
        "education",
        "websites",
      ];

    const sections:
      RepeatableSectionDescriptor[] =
      [];

    for (
      const kind of kinds
    ) {
      const sectionExists =
        hasSectionLabel(
          kind,
        );

      const entryCount =
        countEntries(
          kind,
        );

      const addButton =
        findAddAnotherButton(
          kind,
        );

      if (
        !sectionExists &&
        entryCount === 0 &&
        !addButton
      ) {
        continue;
      }

      sections.push({
        kind,

        title:
          getSectionTitle(
            kind,
          ),

        entryCount,

        canAddAnother:
          Boolean(
            addButton,
          ),

        addButtonText:
          addButton
            ? getElementText(
                addButton,
              )
            : undefined,

        addButtonSelectorHint:
          addButton
            ? buildSelectorHint(
                addButton,
              )
            : undefined,
      });
    }

    const result:
      DynamicSectionScanResult = {
      url:
        window.location.href,

      title:
        document.title,

      scannedAt:
        new Date().toISOString(),

      sectionCount:
        sections.length,

      sections,
    };

    console.debug(
      "Repeatable section detector result:",
      result,
    );

    return result;
  };