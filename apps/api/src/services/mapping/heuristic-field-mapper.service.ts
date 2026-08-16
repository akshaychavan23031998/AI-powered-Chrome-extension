import type {
  ScannedField,
} from "../../schemas/field-mapping.schema.js";

import type {
  CandidateFieldMapping,
} from "../../types/field-mapping.types.js";

interface CandidateValueMap {
  [path: string]:
    | string
    | undefined;
}

const normalize = (
  value:
    | string
    | undefined,
): string => {
  return (
    value
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  );
};

const buildFieldText = (
  field: ScannedField,
): string => {
  return normalize(
    [
      field.label,
      field.name,
      field.placeholder,
      field.ariaLabel,
    ]
      .filter(Boolean)
      .join(" "),
  );
};

const containsAny = (
  value: string,
  patterns: string[],
): boolean => {
  return patterns.some(
    (pattern) =>
      value.includes(pattern),
  );
};

const sensitivePatterns = [
  "gender",
  "sex",
  "race",
  "ethnicity",
  "disability",
  "veteran",
  "religion",
  "sexual orientation",
  "date of birth",
  "birth date",
  "age",
];

const customQuestionPatterns = [
  "sponsorship",
  "sponsor",
  "authorized to work",
  "work authorization",
  "previously worked",
  "worked for nvidia",
  "how did you hear",
  "referral",
  "salary",
  "compensation",
  "relocate",
  "criminal",

  "local given name",
  "local family name",
  "local first name",
  "local last name",
  "native given name",
  "native family name",
  "native first name",
  "native last name",

  "country phone code",
  "phone country code",
  "calling code",
  "dialing code",
  "dialling code",
  "international calling code",

  "phone extension",
  "telephone extension",
  "extension number",
];

interface HeuristicRule {
  targetPath: string;

  confidence: number;

  patterns: string[];
}

const heuristicRules:
  HeuristicRule[] = [
    {
      targetPath:
        "firstName",

      confidence: 0.99,

      patterns: [
        "first name",
        "given name",
        "given name s",
      ],
    },

    {
      targetPath:
        "middleName",

      confidence: 0.98,

      patterns: [
        "middle name",
      ],
    },

    {
      targetPath:
        "lastName",

      confidence: 0.99,

      patterns: [
        "last name",
        "family name",
        "surname",
      ],
    },

    {
      targetPath:
        "email",

      confidence: 0.99,

      patterns: [
        "email address",
        "email",
      ],
    },

    {
      targetPath:
        "phone",

      confidence: 0.98,

      patterns: [
        "phone number",
        "mobile number",
        "telephone number",
        "telephone",
        "phone",
        "mobile",
      ],
    },

    {
      targetPath:
        "location.addressLine1",

      confidence: 0.96,

      patterns: [
        "address line 1",
        "address line1",
        "street address",
        "address 1",
      ],
    },

    {
      targetPath:
        "location.addressLine2",

      confidence: 0.96,

      patterns: [
        "address line 2",
        "address line2",
        "address 2",
        "apartment",
      ],
    },

    {
      targetPath:
        "location.city",

      confidence: 0.97,

      patterns: [
        "city",
        "town",
      ],
    },

    {
      targetPath:
        "location.state",

      confidence: 0.95,

      patterns: [
        "state province",
        "state/province",
        "province",
        "state",
        "region",
      ],
    },

    {
      targetPath:
        "location.postalCode",

      confidence: 0.98,

      patterns: [
        "postal code",
        "zip code",
        "zipcode",
        "zip",
        "pincode",
        "pin code",
      ],
    },

    {
      targetPath:
        "location.country",

      confidence: 0.98,

      patterns: [
        "country region",
        "country/region",
        "country",
      ],
    },

    {
      targetPath:
        "links.linkedin",

      confidence: 0.99,

      patterns: [
        "linkedin",
      ],
    },

    {
      targetPath:
        "links.github",

      confidence: 0.99,

      patterns: [
        "github",
      ],
    },

    {
      targetPath:
        "links.portfolio",

      confidence: 0.96,

      patterns: [
        "portfolio",
      ],
    },

    {
      targetPath:
        "links.website",

      confidence: 0.92,

      patterns: [
        "personal website",
        "website",
      ],
    },
  ];

export const buildCandidateValueMap = (
  candidate: Record<
    string,
    unknown
  >,
): CandidateValueMap => {
  const location =
    candidate.location &&
    typeof candidate.location ===
      "object"
      ? candidate.location as Record<
          string,
          unknown
        >
      : {};

  const links =
    candidate.links &&
    typeof candidate.links ===
      "object"
      ? candidate.links as Record<
          string,
          unknown
        >
      : {};

  const getString = (
    value: unknown,
  ): string | undefined => {
    return typeof value ===
      "string"
      ? value
      : undefined;
  };

  return {
    firstName:
      getString(
        candidate.firstName,
      ),

    middleName:
      getString(
        candidate.middleName,
      ),

    lastName:
      getString(
        candidate.lastName,
      ),

    email:
      getString(
        candidate.email,
      ),

    phone:
      getString(
        candidate.phone,
      ),

    "location.addressLine1":
      getString(
        location.addressLine1,
      ),

    "location.addressLine2":
      getString(
        location.addressLine2,
      ),

    "location.city":
      getString(
        location.city,
      ),

    "location.state":
      getString(
        location.state,
      ),

    "location.postalCode":
      getString(
        location.postalCode,
      ),

    "location.country":
      getString(
        location.country,
      ),

    "links.linkedin":
      getString(
        links.linkedin,
      ),

    "links.github":
      getString(
        links.github,
      ),

    "links.portfolio":
      getString(
        links.portfolio,
      ),

    "links.website":
      getString(
        links.website,
      ),

    summary:
      getString(
        candidate.summary,
      ),
  };
};

const createUnmapped = (
  field: ScannedField,
  reason: string,
): CandidateFieldMapping => {
  return {
    fieldId: field.id,

    label:
      field.label,

    kind:
      field.kind,

    confidence: 0,

    source:
      "unmapped",

    reason,

    requiresReview: false,

    shouldFill: false,
  };
};

export const mapFieldHeuristically = (
  field: ScannedField,
  candidateValues:
    CandidateValueMap,
):
  | CandidateFieldMapping
  | undefined => {
  if (
    !field.visible ||
    field.disabled ||
    field.readOnly
  ) {
    return createUnmapped(
      field,
      "Field is not currently fillable.",
    );
  }

  if (field.hasValue) {
    return createUnmapped(
      field,
      "Field already contains a value.",
    );
  }

  const fieldText =
    buildFieldText(field);

  if (
    containsAny(
      fieldText,
      sensitivePatterns,
    )
  ) {
    return createUnmapped(
      field,
      "Sensitive field requires explicit user input.",
    );
  }

  if (
    containsAny(
      fieldText,
      customQuestionPatterns,
    )
  ) {
    return createUnmapped(
      field,
      "Field requires special handling and is outside Phase 7 candidate mapping.",
    );
  }

  const rule =
    heuristicRules.find(
      (candidateRule) =>
        containsAny(
          fieldText,
          candidateRule.patterns,
        ),
    );

  if (!rule) {
    return undefined;
  }

  const value =
    candidateValues[
      rule.targetPath
    ];

  if (!value?.trim()) {
    return createUnmapped(
      field,
      `Candidate profile has no value for ${rule.targetPath}.`,
    );
  }

  return {
    fieldId:
      field.id,

    label:
      field.label,

    kind:
      field.kind,

    targetPath:
      rule.targetPath,

    value,

    confidence:
      rule.confidence,

    source:
      "heuristic",

    reason:
      `Matched field semantics to ${rule.targetPath}.`,

    requiresReview:
      rule.confidence < 0.85,

    shouldFill: true,
  };
};