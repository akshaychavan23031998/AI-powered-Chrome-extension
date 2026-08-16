import {
  classifyField,
} from "./field-classifier";

import {
  resolveFieldLabel,
} from "./label-resolver";

import {
  querySelectorAllDeep,
} from "./shadow-dom";

import type {
  DomFieldDescriptor,
  DomFieldOption,
} from "../types/dom-field";

const FIELD_SELECTOR = [
  "input",
  "textarea",
  "select",
  "[role='combobox']",
].join(",");

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

const resolveSection = (
  element: HTMLElement,
): string | undefined => {
  const section =
    element.closest(
      [
        "section",
        "fieldset",
        "[role='group']",
        "[data-automation-id*='section']",
      ].join(","),
    );

  if (!section) {
    return undefined;
  }

  const heading =
    section.querySelector(
      [
        "h1",
        "h2",
        "h3",
        "h4",
        "legend",
        "[role='heading']",
      ].join(","),
    );

  const value =
    cleanText(
      heading?.textContent,
    );

  return value || undefined;
};

const buildSelectorHint = (
  element: HTMLElement,
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

  const name =
    element.getAttribute(
      "name",
    );

  if (name) {
    return `[name="${CSS.escape(
      name,
    )}"]`;
  }

  return undefined;
};

const getOptions = (
  element: HTMLElement,
): DomFieldOption[] | undefined => {
  if (
    element instanceof
    HTMLSelectElement
  ) {
    return Array.from(
      element.options,
    ).map((option) => ({
      label:
        cleanText(
          option.textContent,
        ),

      value:
        option.value,

      selected:
        option.selected,
    }));
  }

  return undefined;
};

const getElementValue = (
  element: HTMLElement,
): string | undefined => {
  if (
    element instanceof
      HTMLInputElement ||
    element instanceof
      HTMLTextAreaElement ||
    element instanceof
      HTMLSelectElement
  ) {
    if (
      element instanceof
        HTMLInputElement &&
      (
        element.type ===
          "checkbox" ||
        element.type ===
          "radio"
      )
    ) {
      return element.checked
        ? element.value ||
            "checked"
        : "";
    }

    return element.value;
  }

  return (
    element.getAttribute(
      "aria-valuetext",
    ) ??
    element.textContent ??
    undefined
  );
};

const isRequired = (
  element: HTMLElement,
): boolean => {
  return (
    element.hasAttribute(
      "required",
    ) ||
    element.getAttribute(
      "aria-required",
    ) === "true"
  );
};

const isDisabled = (
  element: HTMLElement,
): boolean => {
  if (
    element instanceof
      HTMLInputElement ||
    element instanceof
      HTMLTextAreaElement ||
    element instanceof
      HTMLSelectElement
  ) {
    return element.disabled;
  }

  return (
    element.getAttribute(
      "aria-disabled",
    ) === "true"
  );
};

const isReadOnly = (
  element: HTMLElement,
): boolean => {
  if (
    element instanceof
      HTMLInputElement ||
    element instanceof
      HTMLTextAreaElement
  ) {
    return element.readOnly;
  }

  return (
    element.getAttribute(
      "aria-readonly",
    ) === "true"
  );
};

const makeFieldId = (
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
    `field-${index}`
  );
};

export const scanDomFields =
  (): DomFieldDescriptor[] => {
    const elements =
      querySelectorAllDeep(
        FIELD_SELECTOR,
      );

    const descriptors:
      DomFieldDescriptor[] = [];

    const seen =
      new Set<HTMLElement>();

    elements.forEach(
      (element, index) => {
        if (
          !(
            element instanceof
            HTMLElement
          )
        ) {
          return;
        }

        if (
          seen.has(element)
        ) {
          return;
        }

        seen.add(element);

        const kind =
          classifyField(
            element,
          );

        const value =
          getElementValue(
            element,
          );

        descriptors.push({
          id: makeFieldId(
            element,
            index,
          ),

          kind,

          tagName:
            element.tagName.toLowerCase(),

          inputType:
            element instanceof
            HTMLInputElement
              ? element.type
              : undefined,

          name:
            element.getAttribute(
              "name",
            ) ?? undefined,

          label:
            resolveFieldLabel(
              element,
            ),

          placeholder:
            element.getAttribute(
              "placeholder",
            ) ?? undefined,

          ariaLabel:
            element.getAttribute(
              "aria-label",
            ) ?? undefined,

          required:
            isRequired(
              element,
            ),

          disabled:
            isDisabled(
              element,
            ),

          readOnly:
            isReadOnly(
              element,
            ),

          visible:
            isVisible(
              element,
            ),

          hasValue:
            Boolean(
              value?.trim(),
            ),

          value:
            value?.trim() ||
            undefined,

          options:
            getOptions(
              element,
            ),

          section:
            resolveSection(
              element,
            ),

          selectorHint:
            buildSelectorHint(
              element,
            ),
        });
      },
    );

    return descriptors;
  };