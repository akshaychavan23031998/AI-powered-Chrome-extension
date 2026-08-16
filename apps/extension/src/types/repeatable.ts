export type RepeatableSectionKind =
  | "workExperience"
  | "education"
  | "websites"
  | "unknown";

export interface RepeatableSectionDescriptor {
  kind: RepeatableSectionKind;

  title: string;

  entryCount: number;

  canAddAnother: boolean;

  addButtonText?: string;

  addButtonSelectorHint?: string;
}

export interface DynamicSectionScanResult {
  url: string;

  title: string;

  scannedAt: string;

  sectionCount: number;

  sections: RepeatableSectionDescriptor[];
}

export interface AddRepeatableEntryResult {
  kind: RepeatableSectionKind;

  added: boolean;

  previousEntryCount: number;

  currentEntryCount: number;

  reason: string;

  scan: DynamicSectionScanResult;
}