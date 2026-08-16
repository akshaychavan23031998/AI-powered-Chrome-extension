import type {
  ScannedField,
} from "../schemas/field-mapping.schema.js";

const ALLOWED_TARGET_PATHS = [
  "firstName",
  "middleName",
  "lastName",
  "email",
  "phone",

  "location.addressLine1",
  "location.addressLine2",
  "location.city",
  "location.state",
  "location.postalCode",
  "location.country",

  "links.linkedin",
  "links.github",
  "links.portfolio",
  "links.website",

  "summary",
];

export const buildFieldMapperPrompt = (
  fields: ScannedField[],
): string => {
  return `
You are mapping Workday job-application fields to an existing candidate profile.

Your job is ONLY to decide which candidate profile field corresponds to each Workday field.

STRICT RULES:

1. Do not generate candidate values.

2. Return only a candidate target path from the allowed target-path list.

3. If there is no safe mapping, use an empty targetPath.

4. Never infer or map sensitive personal information such as:
- gender
- sex
- race
- ethnicity
- disability
- veteran status
- religion
- sexual orientation
- age
- date of birth

5. Do not map custom application questions such as:
- sponsorship
- visa sponsorship
- work authorization
- authorized to work
- previously worked for this company
- referral source
- how the candidate heard about the company
- salary expectations
- compensation expectations
- criminal history
- willingness to relocate

These questions will be handled by a different system later.

6. Do not map fields representing work-experience or education repeatable sections in this phase.

7. Do not map local-name or native-script-name fields such as:
- Local Given Name
- Local Given Name(s)
- Local Family Name
- Local First Name
- Local Last Name
- Native Given Name
- Native Family Name
- Native First Name
- Native Last Name

The current candidate schema does not contain explicit local/native name fields.

Therefore:
- Local Given Name must NOT map to firstName.
- Local Family Name must NOT map to lastName.

Use an empty targetPath for these fields.

8. Do not map phone-country-code fields to the full phone number.

Examples of phone-country-code fields:
- Country Phone Code
- Phone Country Code
- Calling Code
- Dialing Code
- Dialling Code
- International Calling Code

The candidate path "phone" contains the candidate's full phone number, not only the country calling code.

Therefore:
- Country Phone Code must NOT map to phone.
- Calling Code must NOT map to phone.
- Dialing Code must NOT map to phone.

Use an empty targetPath for these fields.

9. Do not map phone-extension fields to the full phone number.

Examples:
- Phone Extension
- Telephone Extension
- Extension Number
- Ext
- Phone Ext

The candidate path "phone" contains the candidate's full phone number, not a telephone extension.

Therefore:
- Phone Extension must NOT map to phone.
- Telephone Extension must NOT map to phone.
- Extension Number must NOT map to phone.

Use an empty targetPath for these fields.

10. Use labels, names, placeholders, ARIA labels and section information together to understand the semantic meaning of a field.

11. Do not map a field simply because one word overlaps with a candidate property.

Examples:
- "Country Phone Code" contains the word "Phone", but it is not the full phone number.
- "Phone Extension" contains the word "Phone", but it is not the full phone number.
- "Local Given Name" contains "Given Name", but it is not equivalent to the standard firstName field.
- "How Did You Hear About Us?" is not a resume-backed candidate field.

12. Prefer being unmapped over returning an unsafe or ambiguous mapping.

Incorrect high-confidence mappings are worse than leaving a field unmapped.

13. confidence must be a number from 0 to 1.

Use these confidence guidelines:

0.95 - 1.00
Only when the meaning is extremely clear.

Examples:
- Given Name -> firstName
- First Name -> firstName
- Family Name -> lastName
- Last Name -> lastName
- Email Address -> email
- Phone Number -> phone
- City -> location.city

0.80 - 0.94
Strong semantic match but terminology may vary.

0.65 - 0.79
Possible mapping with some ambiguity.

Below 0.65
The field should normally remain unmapped.

14. If the correct target path is not available in ALLOWED TARGET PATHS, return an empty targetPath.

15. Do not invent new target paths.

For example, do NOT return unsupported paths such as:
- phoneCountryCode
- phoneExtension
- localFirstName
- localLastName
- workAuthorization
- sponsorship
- referralSource

16. Do not infer information that is not explicitly represented by the candidate schema.

17. Preserve a conservative mapping strategy:

Clear candidate-backed field
-> map it.

Ambiguous field
-> use low confidence or leave unmapped.

Custom question
-> leave unmapped.

Sensitive field
-> leave unmapped.

Unsupported field
-> leave unmapped.

18. A field should map to "phone" only when it represents the actual full phone or mobile number.

Examples that MAY map to phone:
- Phone Number
- Mobile Number
- Telephone Number
- Contact Phone Number

Examples that MUST NOT map to phone:
- Country Phone Code
- Calling Code
- Phone Extension
- Telephone Extension

ALLOWED TARGET PATHS:

${ALLOWED_TARGET_PATHS.join("\n")}

FIELDS TO MAP:

${JSON.stringify(
  fields.map((field) => ({
    fieldId: field.id,
    kind: field.kind,
    label: field.label,
    name:
      field.name ?? "",
    placeholder:
      field.placeholder ?? "",
    ariaLabel:
      field.ariaLabel ?? "",
    section:
      field.section ?? "",
  })),
  null,
  2,
)}

Return JSON matching the required response schema.

For every supplied field:
- fieldId must exactly match the supplied fieldId.
- targetPath must either be one of the allowed target paths or an empty string.
- confidence must be between 0 and 1.
- reason must briefly explain why the field was mapped or intentionally left unmapped.
`;
};