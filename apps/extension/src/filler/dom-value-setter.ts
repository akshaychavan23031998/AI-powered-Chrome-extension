const dispatchInputEvents = (
  element: HTMLElement,
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

const setNativeInputValue = (
  element: HTMLInputElement,
  value: string,
): void => {
  const descriptor =
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    );

  const setter =
    descriptor?.set;

  if (!setter) {
    element.value = value;
  } else {
    setter.call(
      element,
      value,
    );
  }

  dispatchInputEvents(
    element,
  );
};

const setNativeTextareaValue = (
  element: HTMLTextAreaElement,
  value: string,
): void => {
  const descriptor =
    Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    );

  const setter =
    descriptor?.set;

  if (!setter) {
    element.value = value;
  } else {
    setter.call(
      element,
      value,
    );
  }

  dispatchInputEvents(
    element,
  );
};

const setNativeSelectValue = (
  element: HTMLSelectElement,
  value: string,
): boolean => {
  const normalized =
    value
      .trim()
      .toLowerCase();

  const option =
    Array.from(
      element.options,
    ).find((candidate) => {
      return (
        candidate.value
          .trim()
          .toLowerCase() ===
          normalized ||
        candidate.text
          .trim()
          .toLowerCase() ===
          normalized
      );
    });

  if (!option) {
    return false;
  }

  element.value =
    option.value;

  dispatchInputEvents(
    element,
  );

  return true;
};

export const readElementValue = (
  element: HTMLElement,
): string => {
  if (
    element instanceof
      HTMLInputElement ||
    element instanceof
      HTMLTextAreaElement ||
    element instanceof
      HTMLSelectElement
  ) {
    return element.value.trim();
  }

  return (
    element.getAttribute(
      "aria-valuetext",
    ) ??
    element.textContent ??
    ""
  ).trim();
};

export const setElementValue = (
  element: HTMLElement,
  value: string,
): boolean => {
  if (
    element instanceof
    HTMLInputElement
  ) {
    const unsupportedTypes =
      new Set([
        "checkbox",
        "radio",
        "file",
        "button",
        "submit",
        "reset",
      ]);

    if (
      unsupportedTypes.has(
        element.type.toLowerCase(),
      )
    ) {
      return false;
    }

    setNativeInputValue(
      element,
      value,
    );

    return true;
  }

  if (
    element instanceof
    HTMLTextAreaElement
  ) {
    setNativeTextareaValue(
      element,
      value,
    );

    return true;
  }

  if (
    element instanceof
    HTMLSelectElement
  ) {
    return setNativeSelectValue(
      element,
      value,
    );
  }

  return false;
};