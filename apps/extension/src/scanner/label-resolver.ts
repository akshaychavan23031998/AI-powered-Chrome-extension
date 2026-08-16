const cleanText = (
  value: string | null | undefined,
): string => {
  return (
    value
      ?.replace(/\s+/g, " ")
      .trim() ?? ""
  );
};

const getExplicitLabel = (
  element: HTMLElement,
): string => {
  const id = element.id;

  if (!id) {
    return "";
  }

  const label =
    document.querySelector(
      `label[for="${CSS.escape(id)}"]`,
    );

  return cleanText(
    label?.textContent,
  );
};

const getWrappedLabel = (
  element: HTMLElement,
): string => {
  const label =
    element.closest("label");

  return cleanText(
    label?.textContent,
  );
};

const getAriaLabel = (
  element: HTMLElement,
): string => {
  return cleanText(
    element.getAttribute(
      "aria-label",
    ),
  );
};

const getAriaLabelledBy = (
  element: HTMLElement,
): string => {
  const ids =
    element
      .getAttribute(
        "aria-labelledby",
      )
      ?.split(/\s+/)
      .filter(Boolean) ?? [];

  if (ids.length === 0) {
    return "";
  }

  return ids
    .map((id) => {
      const label =
        document.getElementById(id);

      return cleanText(
        label?.textContent,
      );
    })
    .filter(Boolean)
    .join(" ");
};

const getNearbyText = (
  element: HTMLElement,
): string => {
  const container =
    element.closest(
      [
        "[data-automation-id]",
        "[role='group']",
        "fieldset",
        ".formField",
        ".field",
      ].join(","),
    );

  if (!container) {
    return "";
  }

  const labelLike =
    container.querySelector(
      [
        "label",
        "legend",
        "[data-automation-id*='label']",
        "[class*='label']",
      ].join(","),
    );

  return cleanText(
    labelLike?.textContent,
  );
};

export const resolveFieldLabel = (
  element: HTMLElement,
): string => {
  const candidates = [
    getAriaLabel(element),
    getAriaLabelledBy(element),
    getExplicitLabel(element),
    getWrappedLabel(element),
    getNearbyText(element),
    element.getAttribute(
      "placeholder",
    ),
    element.getAttribute(
      "name",
    ),
  ];

  return (
    candidates.find(
      (candidate) =>
        cleanText(candidate).length >
        0,
    ) ?? ""
  );
};