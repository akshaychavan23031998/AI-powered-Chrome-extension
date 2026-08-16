import {
  querySelectorAllDeep,
} from "../scanner/shadow-dom";

import type {
  FillInstruction,
} from "../types/fill";

const escapeSelectorValue = (
  value: string,
): string => {
  return CSS.escape(value);
};

const findBySelectorHint = (
  selectorHint:
    | string
    | undefined,
): HTMLElement | undefined => {
  if (!selectorHint) {
    return undefined;
  }

  try {
    const matches =
      querySelectorAllDeep(
        selectorHint,
      );

    const element =
      matches.find(
        (
          candidate,
        ): candidate is HTMLElement =>
          candidate instanceof HTMLElement,
      );

    return element;
  } catch {
    return undefined;
  }
};

const findById = (
  fieldId: string,
): HTMLElement | undefined => {
  const selector =
    `#${escapeSelectorValue(fieldId)}`;

  const matches =
    querySelectorAllDeep(
      selector,
    );

  return matches.find(
    (
      candidate,
    ): candidate is HTMLElement =>
      candidate instanceof HTMLElement,
  );
};

const findByAutomationId = (
  fieldId: string,
): HTMLElement | undefined => {
  const selector =
    `[data-automation-id="${fieldId.replace(
      /"/g,
      '\\"',
    )}"]`;

  const matches =
    querySelectorAllDeep(
      selector,
    );

  return matches.find(
    (
      candidate,
    ): candidate is HTMLElement =>
      candidate instanceof HTMLElement,
  );
};

const findByName = (
  fieldId: string,
): HTMLElement | undefined => {
  const selector =
    `[name="${fieldId.replace(
      /"/g,
      '\\"',
    )}"]`;

  const matches =
    querySelectorAllDeep(
      selector,
    );

  return matches.find(
    (
      candidate,
    ): candidate is HTMLElement =>
      candidate instanceof HTMLElement,
  );
};

export const locateFieldElement = (
  instruction: FillInstruction,
): HTMLElement | undefined => {
  return (
    findBySelectorHint(
      instruction.selectorHint,
    ) ??
    findById(
      instruction.fieldId,
    ) ??
    findByAutomationId(
      instruction.fieldId,
    ) ??
    findByName(
      instruction.fieldId,
    )
  );
};