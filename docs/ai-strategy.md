# AI Strategy

## 1. Overview

AI is an important part of the Workday AI Application Assistant, but it is not used as the controller of the entire system.

The project uses AI only where semantic interpretation provides meaningful value.

The overall strategy is:

```text
Deterministic Logic
       ↓
Heuristics
       ↓
AI Semantic Reasoning
       ↓
Schema Validation
       ↓
Confidence Evaluation
       ↓
Safe Automation / User Review
```

The central principle is:

> **AI is used to understand information, not to blindly control irreversible actions.**

---

# 2. AI Provider

The backend integrates with Google Gemini using:

```text
@google/genai
```

The configured model is:

```text
gemini-2.5-flash
```

The model name is controlled through:

```text
GEMINI_MODEL
```

instead of being permanently hardcoded throughout application logic.

---

# 3. Backend-Only AI Access

Gemini is accessed only from the backend.

Correct architecture:

```text
Chrome Extension
      ↓
Backend API
      ↓
Gemini
```

Incorrect architecture:

```text
Chrome Extension
      ↓
Gemini API directly
```

The second architecture would expose the Gemini API key inside the browser extension bundle.

Therefore:

```text
GEMINI_API_KEY
```

is backend-only.

---

# 4. Primary AI Use Cases

AI is primarily used for:

1. understanding resume text,
2. converting unstructured resume data into structured candidate data,
3. semantic interpretation for ambiguous field mapping,
4. future support for candidate-aware custom question suggestions.

AI is not used for:

- direct browser control,
- CAPTCHA handling,
- MFA handling,
- login bypass,
- arbitrary Workday button clicking,
- inferring sensitive demographic information,
- silent final submission.

---

# 5. Resume Understanding Problem

A resume is fundamentally unstructured or semi-structured text.

For example:

```text
SuperAGI (formerly Contlo), Bengaluru
Nov 2025 – Apr 2026
Software Development Engineer I

Built campaign creation and management features...
```

The application needs:

```json
{
  "company": "SuperAGI (formerly Contlo)",
  "location": "Bengaluru",
  "startDate": "2025-11",
  "endDate": "2026-04",
  "title": "Software Development Engineer I",
  "current": false
}
```

This semantic transformation is well suited to AI.

---

# 6. Resume AI Pipeline

```text
PDF / DOCX
     ↓
Deterministic Text Extraction
     ↓
Normalized Raw Text
     ↓
Gemini Prompt
     ↓
Structured JSON Response
     ↓
JSON Parsing
     ↓
Zod Validation
     ↓
Candidate Normalization
     ↓
Application Candidate Schema
     ↓
MongoDB
```

Gemini is one stage in the pipeline, not the entire pipeline.

---

# 7. Deterministic Parsing Before AI

AI does not receive the raw file directly in the implemented architecture.

Instead:

```text
PDF → pdfjs-dist
DOCX → mammoth
```

first extract text.

This has several advantages:

- easier debugging,
- lower coupling,
- predictable upload handling,
- separate parser testing,
- easier model replacement,
- clear distinction between document extraction and semantic interpretation.

---

# 8. Structured AI Output

Gemini is asked for structured candidate JSON rather than narrative prose.

The structured response includes:

```text
firstName
middleName
lastName
email
phone
location
links
summary
skills
experience
education
certifications
```

This makes the model response easier to:

- validate,
- normalize,
- store,
- consume,
- test.

---

# 9. Why Free-Form AI Responses Are Avoided

A free-form response such as:

```text
The candidate's name is Akshay and they worked at...
```

would require additional parsing and would be difficult to validate reliably.

Structured output allows the backend to reason about a known shape.

Example:

```json
{
  "firstName": "Akshay",
  "middleName": "Ram",
  "lastName": "Chavan",
  "skills": [],
  "experience": [],
  "education": []
}
```

---

# 10. Prompt Design Principles

The resume prompt follows strict extraction rules.

Gemini is instructed to:

- use information supported by the resume,
- avoid inventing employers,
- avoid inventing job titles,
- avoid inventing dates,
- avoid inventing certifications,
- avoid inventing URLs,
- avoid inventing location data,
- distinguish work experience from projects,
- distinguish education from unrelated text,
- normalize obvious extraction artifacts conservatively.

---

# 11. Unknown Information Strategy

Missing information should remain missing.

The system does not follow:

```text
Missing information
       ↓
AI guess
```

Instead:

```text
Missing information
       ↓
Empty / undefined / manual review
```

This is important because incorrect candidate information can be more harmful than incomplete information.

---

# 12. Link Hallucination Prevention

Resume text extraction may produce:

```text
LinkedIn
GitHub
Portfolio
```

while losing the actual hyperlink targets.

The model is explicitly instructed not to convert those labels into guessed URLs.

For example, the system must not invent:

```text
linkedin.com/in/candidate-name
github.com/candidate-name
```

unless the actual URL exists in the available extracted content.

---

# 13. Resume Formatting Artifacts

Document extraction can produce formatting artifacts.

Examples:

```text
A KSHAY R AM C HAVAN
```

or:

```text
KSHAY AM HAVAN
A
R
C
```

Gemini may normalize an obvious extraction artifact when the intended value is strongly supported.

Example:

```text
Akshay Ram Chavan
```

However, normalization must not become fabrication.

---

# 14. Date Normalization

Resume dates can appear as:

```text
Nov 2025 – Apr 2026
```

The preferred normalized representation is:

```text
2025-11
2026-04
```

If only a year is present:

```text
2021
```

the model should not invent a month.

The principle is:

> Normalize available precision; do not manufacture unavailable precision.

---

# 15. Current Employment

Current employment can be represented using:

```json
{
  "current": true,
  "endDate": ""
}
```

The normalization layer can later convert that empty end date into the application's preferred representation.

Completed employment uses:

```json
{
  "current": false
}
```

with an end date when supported by the resume.

---

# 16. Low Temperature

Resume understanding is an extraction problem rather than a creative generation problem.

Therefore low temperature is used.

Example:

```text
temperature = 0.1
```

The intended effect is:

- lower variation,
- more repeatable results,
- less creative inference,
- more deterministic extraction behavior.

---

# 17. Two-Schema Validation Strategy

The project separates:

```text
Gemini response schema
```

from:

```text
application candidate schema
```

This is intentional.

Gemini output benefits from predictable required structures.

For example:

```text
missing optional text → ""
missing list → []
boolean → false
```

The application domain may prefer:

```text
optional text → undefined
current endDate → null
```

The normalization layer bridges these representations.

---

# 18. AI Output Validation

Gemini output is never treated as trusted application data.

Pipeline:

```text
Gemini Response Text
       ↓
JSON.parse()
       ↓
geminiCandidateSchema.safeParse()
       ↓
Valid?
   ├── No → API error
   │
   └── Yes
        ↓
Candidate Normalizer
        ↓
candidateProfileSchema
        ↓
Persistence
```

This protects the database from malformed model output.

---

# 19. Candidate Normalization

The normalization service may perform:

- whitespace trimming,
- optional value cleanup,
- duplicate skill removal,
- empty entry removal,
- current-employment normalization,
- consistent object shape conversion.

Example:

```text
" React.js "
```

becomes:

```text
React.js
```

Duplicate values such as:

```text
React.js
react.js
```

can be treated as a single skill.

---

# 20. Why AI Does Not Write Directly to MongoDB

The architecture intentionally rejects:

```text
Gemini
 ↓
MongoDB
```

Instead:

```text
Gemini
 ↓
Zod
 ↓
Normalizer
 ↓
Candidate Schema
 ↓
MongoDB
```

Benefits:

- deterministic validation,
- stronger domain constraints,
- easier debugging,
- easier testing,
- reduced hallucination impact.

---

# 21. Semantic Workday Mapping

AI can also support semantic Workday field mapping.

Workday field labels may differ from candidate profile names.

Examples:

```text
Legal Given Name
```

can map to:

```text
firstName
```

and:

```text
Family Name
```

can map to:

```text
lastName
```

Simple cases are handled deterministically when possible.

---

# 22. Heuristic-First Field Mapping

The application should not ask Gemini to map obvious fields.

Examples:

```text
First Name → firstName
Last Name → lastName
Email Address → email
Phone Number → phone
City → location.city
```

Advantages:

- reduced latency,
- reduced AI cost,
- increased consistency,
- easier test coverage.

---

# 23. AI Fallback for Ambiguous Fields

AI becomes useful when labels are less explicit.

Example:

```text
Professional Profile
```

could refer to:

```text
LinkedIn
Portfolio
Website
GitHub
```

The mapper can use:

```text
field label
field description
placeholder
control type
candidate profile context
```

to determine the likely mapping.

---

# 24. Confidence Model

Mapping results contain confidence.

Example:

```json
{
  "fieldId": "field-1",
  "targetPath": "firstName",
  "value": "Akshay",
  "confidence": 0.98,
  "shouldFill": true
}
```

The important distinction is:

```text
AI believes mapping exists
```

is not the same as:

```text
field should automatically be filled
```

Confidence acts as an automation gate.

---

# 25. Safe Confidence Strategy

Conceptually:

```text
Very high confidence
    ↓
Safe autofill candidate

Medium confidence
    ↓
Manual review / suggestion

Low confidence
    ↓
Do not fill
```

The project intentionally favors false negatives over false positives in form filling.

Leaving one field empty is safer than submitting incorrect personal information.

---

# 26. AI and Existing Field Values

AI mapping does not automatically justify overwriting existing Workday values.

Autofill still considers:

```text
existing field value
confidence
shouldFill
candidate value
field state
```

This keeps AI interpretation separate from destructive mutation decisions.

---

# 27. AI and Workday Questions

Some application questions could theoretically benefit from AI.

Examples:

```text
Why are you interested in this role?
Describe your relevant experience.
```

However, subjective generated answers should be treated as suggestions rather than irreversible truth.

A future workflow could use:

```text
Candidate Profile
       +
Job Description
       +
Question
       ↓
Draft Answer
       ↓
User Review
```

---

# 28. Yes / No Questions

Some Yes / No questions require facts that may not exist in the resume.

Examples:

```text
Are you legally authorized to work?
Do you require sponsorship?
Have you worked for us before?
Are you willing to relocate?
```

The AI must not manufacture those facts.

When explicit candidate data is unavailable:

```text
manual review
```

is the correct result.

---

# 29. Sensitive Information Policy

AI must not infer unknown sensitive information.

Examples include:

```text
gender
race
ethnicity
disability status
veteran status
religion
sexual orientation
health information
```

Even if a model could make a probabilistic guess from:

```text
name
location
employment
education
```

the system must not use such guesses.

---

# 30. AI and EEO Questions

Voluntary disclosure questions are treated conservatively.

The system should distinguish between:

```text
deterministic candidate information
```

and:

```text
sensitive voluntary information
```

Unknown sensitive information must remain unresolved.

---

# 31. AI Failure Modes

Potential AI failures include:

- network error,
- quota exhaustion,
- rate limit,
- timeout,
- empty response,
- invalid JSON,
- schema mismatch,
- unexpected model output,
- temporary provider outage.

These errors should not cause uncontrolled browser automation.

---

# 32. Error Handling Strategy

If Gemini resume parsing fails:

```text
Resume
 ↓
Gemini Failure
 ↓
Controlled API Error
 ↓
No invalid candidate stored
```

If semantic mapping fails:

```text
Field Scan
 ↓
Mapping Failure
 ↓
No unsafe autofill
```

This is a fail-safe design.

---

# 33. AI Cost Strategy

The architecture reduces unnecessary model usage.

Instead of reparsing the resume for every application:

```text
Resume
 ↓
Gemini once
 ↓
Stored Candidate Profile
```

The profile can then be reused.

Likewise, deterministic field mappings do not require Gemini.

---

# 34. AI Latency Strategy

The system avoids architectures such as:

```text
Every form field
      ↓
Gemini request
```

because that would increase:

- latency,
- API calls,
- cost,
- failure surface.

Instead:

```text
Candidate Profile
      ↓
Local heuristics
      ↓
AI only where required
```

---

# 35. Explainability

The system keeps mapping decisions inspectable.

Example:

```json
{
  "label": "Legal First Name",
  "targetPath": "firstName",
  "value": "Akshay",
  "confidence": 0.98,
  "shouldFill": true
}
```

This is easier to understand and debug than opaque browser behavior.

---

# 36. AI Security

Sensitive backend credentials are stored through environment variables.

Examples:

```text
GEMINI_API_KEY
MONGODB_URI
```

They are not included in:

- React popup source,
- content script source,
- background bundle,
- manifest,
- Git repository.

---

# 37. Model Replaceability

Because AI integration is isolated inside backend services, the architecture can support future model changes without rewriting the Chrome extension.

Conceptually:

```text
Extension
   ↓
Stable Backend Contract
   ↓
Current AI Provider
```

The extension does not need to know which AI model is used internally.

---

# 38. Future AI Enhancements

Possible future improvements include:

- calibrated confidence scoring,
- embedding-based field similarity,
- role-aware custom answer generation,
- job-description understanding,
- candidate profile correction UI,
- AI-assisted final review comparison,
- resume inconsistency detection,
- better hyperlink extraction,
- AI provider fallback,
- request caching,
- model response observability.

These enhancements should preserve the current safety model.

---

# 39. AI Design Principles

The project follows these rules:

## Rule 1

Use deterministic logic when deterministic logic is enough.

## Rule 2

AI output must be validated.

## Rule 3

Unknown facts must remain unknown.

## Rule 4

Sensitive information must not be inferred.

## Rule 5

AI credentials remain server-side.

## Rule 6

Confidence gates automation.

## Rule 7

AI does not bypass browser or authentication security.

## Rule 8

AI does not silently submit applications.

## Rule 9

User review is part of the architecture, not a failure of the architecture.

---

# 40. Final AI Strategy

The complete AI reasoning philosophy can be summarized as:

```text
Extract deterministically
        ↓
Understand semantically
        ↓
Validate structurally
        ↓
Normalize deterministically
        ↓
Map heuristically
        ↓
Use AI for ambiguity
        ↓
Evaluate confidence
        ↓
Autofill only when safe
        ↓
Return uncertainty to user
```

The most important rule is:

> **AI may help understand who the candidate is, but it must never invent who the candidate is.**
