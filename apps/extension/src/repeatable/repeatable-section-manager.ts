import {
  waitForCondition,
  waitForDomMutation,
} from "../dynamic/mutation-waiter";

import {
  findAddAnotherButton,
  scanRepeatableSections,
} from "./repeatable-section-detector";

import type {
  AddRepeatableEntryResult,
  RepeatableSectionKind,
} from "../types/repeatable";

const getEntryCount = (
  kind: RepeatableSectionKind,
): number => {
  const scan =
    scanRepeatableSections();

  return (
    scan.sections.find(
      (section) =>
        section.kind ===
        kind,
    )?.entryCount ?? 0
  );
};

export const addRepeatableEntry =
  async (
    kind:
      RepeatableSectionKind,
  ): Promise<AddRepeatableEntryResult> => {
    if (
      kind ===
      "unknown"
    ) {
      const scan =
        scanRepeatableSections();

      return {
        kind,

        added: false,

        previousEntryCount: 0,

        currentEntryCount: 0,

        reason:
          "Unknown repeatable section type.",

        scan,
      };
    }

    const previousEntryCount =
      getEntryCount(
        kind,
      );

    const button =
      findAddAnotherButton(
        kind,
      );

    if (!button) {
      const scan =
        scanRepeatableSections();

      return {
        kind,

        added: false,

        previousEntryCount,

        currentEntryCount:
          previousEntryCount,

        reason:
          "Add Another button was not found for this section.",

        scan,
      };
    }

    const mutationPromise =
      waitForDomMutation({
        timeoutMs: 5000,
      });

    button.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    button.click();

    await mutationPromise;

    const countChanged =
      await waitForCondition(
        () =>
          getEntryCount(
            kind,
          ) >
          previousEntryCount,
        5000,
        150,
      );

    const scan =
      scanRepeatableSections();

    const currentEntryCount =
      scan.sections.find(
        (section) =>
          section.kind ===
          kind,
      )?.entryCount ??
      previousEntryCount;

    return {
      kind,

      added:
        countChanged,

      previousEntryCount,

      currentEntryCount,

      reason:
        countChanged
          ? "Repeatable Workday entry added successfully."
          : "Workday DOM changed, but a new repeatable entry could not be confirmed.",

      scan,
    };
  };