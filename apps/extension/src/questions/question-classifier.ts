import type {
  QuestionCategory,
  QuestionSensitivity,
} from "../types/question";

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

const sensitivePatterns = [
  "self-identification of gender",
  "self identification of gender",
  "gender",
  "sex",
  "race",
  "ethnicity",
  "ethnic",
  "veteran",
  "disability",
  "disabled",
  "self identify",
  "self-identify",
  "self identification",
  "self-identification",
  "military",
  "protected veteran",
  "hispanic",
  "latino",
  "sexual orientation",
  "gender identity",
  "national origin",
  "religion",
  "marital status",
];

const authorizationPatterns = [
  "legally authorized",
  "legal authorization",
  "authorized to work",
  "authorization to work",
  "work authorization",
  "right to work",
  "eligible to work",
];

const sponsorshipPatterns = [
  "sponsorship",
  "sponsor",
  "visa support",
  "immigration support",
  "work permit",
  "employment visa",
  "require employer support",
  "future sponsorship",
];

const previousEmploymentPatterns = [
  "previously worked",
  "previously work",
  "worked for nvidia",
  "former employee",
  "former contractor",
  "previous employee",
  "previous contractor",
  "worked here before",
];

const sourcePatterns = [
  "how did you hear",
  "how did you find",
  "where did you hear",
  "where did you learn",
  "job source",
];

const consentPatterns = [
  "terms and conditions",
  "terms of service",
  "applicant privacy policy",
  "privacy policy",
  "i agree",
  "i accept",
  "by selecting the checkbox",
];

const includesPattern = (
  value: string,
  patterns: string[],
): boolean => {
  return patterns.some(
    (pattern) =>
      value.includes(
        pattern,
      ),
  );
};

export const classifyQuestion =
  (
    label: string,
  ): {
    category: QuestionCategory;
    sensitivity: QuestionSensitivity;
  } => {
    const value =
      normalize(label);

    if (
      includesPattern(
        value,
        sensitivePatterns,
      )
    ) {
      return {
        category:
          "sensitive",

        sensitivity:
          "sensitive",
      };
    }

    if (
      includesPattern(
        value,
        authorizationPatterns,
      )
    ) {
      return {
        category:
          "authorization",

        sensitivity:
          "normal",
      };
    }

    if (
      includesPattern(
        value,
        sponsorshipPatterns,
      )
    ) {
      return {
        category:
          "sponsorship",

        sensitivity:
          "normal",
      };
    }

    if (
      includesPattern(
        value,
        previousEmploymentPatterns,
      )
    ) {
      return {
        category:
          "previousEmployment",

        sensitivity:
          "normal",
      };
    }

    if (
      includesPattern(
        value,
        sourcePatterns,
      )
    ) {
      return {
        category:
          "source",

        sensitivity:
          "normal",
      };
    }

    if (
      includesPattern(
        value,
        consentPatterns,
      )
    ) {
      return {
        category:
          "consent",

        sensitivity:
          "normal",
      };
    }

    return {
      category:
        "custom",

      sensitivity:
        "normal",
    };
  };