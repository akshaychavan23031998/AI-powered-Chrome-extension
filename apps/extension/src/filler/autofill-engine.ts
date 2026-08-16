import {
  locateFieldElement,
} from "./field-locator";

import {
  readElementValue,
  setElementValue,
} from "./dom-value-setter";

import type {
  AutofillResult,
  FieldFillResult,
  FillInstruction,
} from "../types/fill";

const MIN_AUTOFILL_CONFIDENCE =
  0.9;

const wait = (
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

const normalizeComparableValue = (
  value: string,
): string => {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

const valuesMatch = (
  expected: string,
  actual: string,
): boolean => {
  return (
    normalizeComparableValue(
      expected,
    ) ===
    normalizeComparableValue(
      actual,
    )
  );
};

const normalizePhoneForWorkday = (
  value: string,
): string => {
  const trimmed =
    value.trim();

  const digitsOnly =
    trimmed.replace(
      /\D/g,
      "",
    );

  if (
    trimmed.startsWith("+91") &&
    digitsOnly.length === 12
  ) {
    return digitsOnly.slice(2);
  }

  return trimmed;
};

const resolveFillValue = (
  instruction: FillInstruction,
): string => {
  const normalizedLabel =
    instruction.label
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  if (
    instruction.targetPath ===
      "phone" &&
    (
      normalizedLabel ===
        "phone number" ||
      normalizedLabel ===
        "phone number*" ||
      normalizedLabel.includes(
        "phone number",
      )
    )
  ) {
    return normalizePhoneForWorkday(
      instruction.value,
    );
  }

  return instruction.value;
};

const fillSingleField =
  async (
    instruction:
      FillInstruction,
  ): Promise<FieldFillResult> => {
    if (
      instruction.confidence <
      MIN_AUTOFILL_CONFIDENCE
    ) {
      return {
        fieldId:
          instruction.fieldId,

        label:
          instruction.label,

        targetPath:
          instruction.targetPath,

        status:
          "skipped",

        reason:
          "Mapping confidence is below the autofill threshold.",
      };
    }

    const element =
      locateFieldElement(
        instruction,
      );

    if (!element) {
      return {
        fieldId:
          instruction.fieldId,

        label:
          instruction.label,

        targetPath:
          instruction.targetPath,

        status:
          "failed",

        expectedValue:
          instruction.value,

        reason:
          "Unable to locate the Workday field.",
      };
    }

    if (
      element instanceof
        HTMLInputElement ||
      element instanceof
        HTMLTextAreaElement ||
      element instanceof
        HTMLSelectElement
    ) {
      if (
        element.disabled
      ) {
        return {
          fieldId:
            instruction.fieldId,

          label:
            instruction.label,

          targetPath:
            instruction.targetPath,

          status:
            "skipped",

          reason:
            "Field is disabled.",
        };
      }
    }

    if (
      element instanceof
        HTMLInputElement ||
      element instanceof
        HTMLTextAreaElement
    ) {
      if (
        element.readOnly
      ) {
        return {
          fieldId:
            instruction.fieldId,

          label:
            instruction.label,

          targetPath:
            instruction.targetPath,

          status:
            "skipped",

          reason:
            "Field is read-only.",
        };
      }
    }

    const existingValue =
      readElementValue(
        element,
      );

    if (
      existingValue.length > 0
    ) {
      return {
        fieldId:
          instruction.fieldId,

        label:
          instruction.label,

        targetPath:
          instruction.targetPath,

        status:
          "skipped",

        expectedValue:
          instruction.value,

        actualValue:
          existingValue,

        reason:
          "Existing Workday value was preserved.",
      };
    }

    const fillValue =
      resolveFillValue(
        instruction,
      );

    const supported =
      setElementValue(
        element,
        fillValue,
      );

    if (!supported) {
      return {
        fieldId:
          instruction.fieldId,

        label:
          instruction.label,

        targetPath:
          instruction.targetPath,

        status:
          "skipped",

        expectedValue:
          fillValue,

        reason:
          "Field type is not supported by the Phase 8 autofill engine.",
      };
    }

    await wait(
      150,
    );

    const actualValue =
      readElementValue(
        element,
      );

    if (
      !valuesMatch(
        fillValue,
        actualValue,
      )
    ) {
      return {
        fieldId:
          instruction.fieldId,

        label:
          instruction.label,

        targetPath:
          instruction.targetPath,

        status:
          "failed",

        expectedValue:
          fillValue,

        actualValue,

        reason:
          "Workday did not retain the expected value.",
      };
    }

    return {
      fieldId:
        instruction.fieldId,

      label:
        instruction.label,

      targetPath:
        instruction.targetPath,

      status:
        "filled",

      expectedValue:
        fillValue,

      actualValue,

      reason:
        "Field filled and validated successfully.",
    };
  };

export const runAutofill =
  async (
    instructions:
      FillInstruction[],
  ): Promise<AutofillResult> => {
    const results:
      FieldFillResult[] =
      [];

    for (
      const instruction of
        instructions
    ) {
      const result =
        await fillSingleField(
          instruction,
        );

      results.push(
        result,
      );
    }

    return {
      attemptedCount:
        instructions.length,

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

      results,
    };
  };