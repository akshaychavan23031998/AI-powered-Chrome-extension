import type {
  DomFieldKind,
} from "../types/dom-field";

const getRole = (
  element: HTMLElement,
): string => {
  return (
    element
      .getAttribute("role")
      ?.toLowerCase() ?? ""
  );
};

export const classifyField = (
  element: HTMLElement,
): DomFieldKind => {
  const tagName =
    element.tagName.toLowerCase();

  if (
    element instanceof
    HTMLTextAreaElement
  ) {
    return "textarea";
  }

  if (
    element instanceof
    HTMLSelectElement
  ) {
    return "select";
  }

  const role =
    getRole(element);

  if (
    role === "combobox"
  ) {
    return "combobox";
  }

  if (
    !(element instanceof HTMLInputElement)
  ) {
    return "unknown";
  }

  switch (
    element.type.toLowerCase()
  ) {
    case "email":
      return "email";

    case "tel":
      return "phone";

    case "number":
      return "number";

    case "date":
    case "month":
      return "date";

    case "radio":
      return "radio";

    case "checkbox":
      return "checkbox";

    case "file":
      return "file";

    case "text":
    case "search":
    case "url":
    case "password":
      return "text";

    default:
      if (
        tagName === "input"
      ) {
        return "text";
      }

      return "unknown";
  }
};