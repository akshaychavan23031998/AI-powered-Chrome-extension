export type DomFieldKind =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "textarea"
  | "select"
  | "combobox"
  | "date"
  | "radio"
  | "checkbox"
  | "file"
  | "unknown";

export interface DomFieldOption {
  label: string;
  value: string;
  selected?: boolean;
}

export interface DomFieldDescriptor {
  id: string;

  kind: DomFieldKind;

  tagName: string;

  inputType?: string;

  name?: string;

  label: string;

  placeholder?: string;

  ariaLabel?: string;

  required: boolean;

  disabled: boolean;

  readOnly: boolean;

  visible: boolean;

  hasValue: boolean;

  value?: string;

  options?: DomFieldOption[];

  section?: string;

  selectorHint?: string;
}

export interface WorkdayScanResult {
  url: string;

  title: string;

  detected: boolean;

  scannedAt: string;

  fieldCount: number;

  fields: DomFieldDescriptor[];
}