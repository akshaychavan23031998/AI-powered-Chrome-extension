# Testing Strategy

## 1. Overview

Testing for the Workday AI Application Assistant is designed around both:

```text
functional correctness
```

and:

```text
automation safety
```

This distinction is important.

A traditional application test may ask:

> Did the feature execute?

For this project, testing must also ask:

> Did the feature refuse to execute when execution would be unsafe?

The system includes:

- backend APIs,
- MongoDB,
- Gemini,
- resume parsing,
- Chrome extension runtime,
- DOM automation,
- dynamic page handling,
- multi-step workflows,
- final application submission.

Therefore a layered testing strategy is required.

---

# 2. Testing Layers

```text
Static Type Checking
        ↓
Build Validation
        ↓
Unit Tests
        ↓
Integration Tests
        ↓
Backend Runtime Tests
        ↓
Resume Parser Tests
        ↓
AI Integration Tests
        ↓
MongoDB Tests
        ↓
Extension Build Tests
        ↓
Chrome Runtime Tests
        ↓
Workday DOM Tests
        ↓
Safety Regression Tests
        ↓
Manual End-to-End Verification
```

No single layer is sufficient by itself.

---

# 3. Backend Build Validation

Run:

```bash
npm run build:api
```

This executes the TypeScript compiler for the backend workspace.

Expected:

```text
tsc
```

with no TypeScript errors.

A backend change is not considered ready if compilation fails.

---

# 4. Backend Type Checking

Run:

```bash
npm --workspace apps/api run typecheck
```

Expected:

```text
tsc --noEmit
```

with zero errors.

This catches:

- incorrect parameter types,
- invalid imports,
- incompatible return types,
- missing properties,
- unsafe TypeScript assumptions.

---

# 5. Chrome Extension Build

Run:

```bash
npm run build:extension
```

The build performs TypeScript validation and Vite production bundling.

Expected output includes:

```text
dist/index.html
dist/background.js
dist/content.js
dist/manifest.json
dist/assets/
```

A successful build proves that:

- React compiles,
- Chrome typings are available,
- background worker compiles,
- content script compiles,
- Manifest assets can be generated.

---

# 6. Chrome API Type Validation

The extension uses:

```text
@types/chrome
```

to type Chrome APIs such as:

```text
chrome.runtime
chrome.storage
chrome.tabs
```

This prevents using:

```ts
declare const chrome: any;
```

which would remove useful compile-time safety.

---

# 7. Git Diff Validation

Before commits:

```bash
git diff --check
```

This checks for whitespace problems.

Windows can display LF-to-CRLF warnings.

Warnings about future line-ending conversion are different from actual `git diff --check` failures.

---

# 8. Git Status Verification

Before commits:

```bash
git status --short
```

and:

```bash
git status
```

are used to verify:

- intended changed files,
- deleted `.gitkeep` placeholders,
- newly created source files,
- absence of `.env`,
- absence of accidentally generated secrets.

---

# 9. Secret Safety Verification

Before push, verify that:

```text
apps/api/.env
```

is not staged.

The repository may contain:

```text
apps/api/.env.example
```

but never the real:

```text
MONGODB_URI
GEMINI_API_KEY
```

values.

---

# 10. Backend Local Startup Test

Run:

```bash
npm run dev:api
```

Expected:

```text
MongoDB connected
API running at http://localhost:4000
```

This confirms:

- environment parsing,
- MongoDB credentials,
- database connectivity,
- Express startup.

---

# 11. Health Endpoint Test

Local endpoint:

```text
http://localhost:4000/api/health
```

Production endpoint:

```text
https://ai-powered-chrome-extension-api.vercel.app/api/health
```

Expected structure:

```json
{
  "success": true,
  "service": "workday-ai-api",
  "status": "healthy",
  "database": "connected",
  "timestamp": "..."
}
```

Important assertions:

```text
success === true
status === healthy
database === connected
```

---

# 12. Root API Test

Backend root:

```text
GET /
```

should return a valid API response identifying the service.

This confirms the Express application itself is reachable.

---

# 13. Not-Found Test

Example request:

```text
GET /api/random
```

Expected:

```json
{
  "success": false,
  "message": "Route not found: GET /api/random"
}
```

This verifies centralized 404 handling.

---

# 14. Error Middleware Testing

The centralized error middleware must handle:

- custom API errors,
- Zod validation errors,
- Multer upload errors,
- unknown server errors.

Expected behavior:

```text
Known client issue → controlled 4xx response
Unexpected server issue → controlled 500 response
```

rather than an unhandled application crash.

---

# 15. Resume PDF Test

Example:

```powershell
curl.exe -X POST `
  -F "resume=@C:\path\resume.pdf" `
  http://localhost:4000/api/resumes/extract
```

Expected:

```text
success = true
file.originalName exists
file.mimeType = application/pdf
file.size > 0
text is non-empty
```

---

# 16. Resume DOCX Test

Example:

```powershell
curl.exe -X POST `
  -F "resume=@C:\path\resume.docx" `
  http://localhost:4000/api/resumes/extract
```

Expected:

```text
success = true
text is non-empty
```

The project specifically verifies DOCX behavior when Windows reports:

```text
application/octet-stream
```

instead of the expected DOCX MIME type.

---

# 17. Unsupported Resume Test

Upload a file that is neither PDF nor DOCX.

Expected controlled response:

```text
Only PDF and DOCX resume files are supported.
```

No unsupported file should continue into the parser.

---

# 18. Missing Resume Test

Request:

```text
POST /api/ai/resumes/parse
```

without multipart resume.

Expected:

```json
{
  "success": false,
  "message": "Resume file is required."
}
```

This proves required upload validation occurs before AI processing.

---

# 19. Resume Extraction Quality Test

Extracted resume text should contain major source sections such as:

```text
profile summary
skills
work experience
projects
education
```

Formatting does not need to be visually identical to the PDF/DOCX because parsers work with document text structure rather than original layout.

---

# 20. Gemini PDF Integration Test

Pipeline:

```text
PDF
 ↓
Text extraction
 ↓
Gemini
 ↓
Structured candidate
 ↓
MongoDB
```

Expected candidate fields include:

```text
name
email
phone
summary
skills
experience
education
certifications
```

The request should return a candidate ID after successful persistence.

---

# 21. Gemini DOCX Integration Test

The same workflow is tested with DOCX.

PDF and DOCX outputs may differ slightly in formatting.

Examples:

```text
+918180004924
```

versus:

```text
+91 8180004924
```

Such differences are acceptable if semantic candidate data remains correct.

---

# 22. AI Hallucination Test

If extracted text includes:

```text
LinkedIn
GitHub
Portfolio
```

but no actual URLs, the AI should not invent URLs.

Expected:

```text
links remain empty unless source data supports them
```

This is an important regression test.

---

# 23. AI Structural Validation Test

If Gemini returns malformed JSON:

```text
request must fail safely
```

If Gemini returns valid JSON with the wrong structure:

```text
Zod validation must fail
```

Invalid AI data must not enter MongoDB.

---

# 24. Candidate Creation Test

Example:

```text
POST /api/candidates
```

with valid structured candidate JSON.

Expected:

```text
201
success = true
MongoDB _id returned
```

---

# 25. Candidate Retrieval Test

Request:

```text
GET /api/candidates/:candidateId
```

Expected:

```text
success = true
same persisted candidate returned
```

This proves candidate persistence survives beyond the original request.

---

# 26. Invalid Candidate ID Test

Example:

```text
GET /api/candidates/invalid-id
```

Expected:

```json
{
  "success": false,
  "message": "Invalid candidate ID."
}
```

The system must reject the invalid ObjectId before allowing Mongoose to throw a generic CastError.

---

# 27. Candidate Not Found Test

A syntactically valid MongoDB ObjectId that does not exist should result in a controlled:

```text
404
Candidate profile not found.
```

rather than a server error.

---

# 28. MongoDB Connection Test

Local:

```text
MongoDB connected
```

must be observed.

Production:

```text
database = connected
```

must be returned by `/api/health`.

---

# 29. Vercel Runtime Test

The project specifically validates that Vercel can load the Express application.

The Express app is default-exported from:

```text
app.ts
```

This prevents Vercel errors such as:

```text
Invalid export found in module
```

---

# 30. Vercel MongoDB Test

Vercel executes the application differently from local `server.ts`.

Testing verifies that:

```text
app.ts
```

can ensure MongoDB connectivity before route execution.

Production health returning:

```text
"database": "connected"
```

is required.

---

# 31. Chrome Manifest Test

Build the extension and inspect:

```text
apps/extension/dist/manifest.json
```

Verify:

```text
manifest_version = 3
background.service_worker exists
action.default_popup exists
required permissions exist
Workday host permissions exist
production backend host permission exists
```

---

# 32. Extension Installation Test

Open:

```text
chrome://extensions
```

Enable:

```text
Developer mode
```

Choose:

```text
Load unpacked
```

Select:

```text
apps/extension/dist
```

Expected:

```text
Workday AI Application Assistant
```

loads without manifest errors.

---

# 33. Extension Reload Test

After rebuilding:

```bash
npm run build:extension
```

Chrome must be explicitly reloaded from:

```text
chrome://extensions
```

Refreshing a normal webpage does not reload the background service worker or extension bundle.

---

# 34. Service Worker Test

Open the extension card and inspect:

```text
service worker
```

Expected console output includes:

```text
Workday AI Assistant service worker loaded.
```

This verifies background initialization.

---

# 35. Backend Connectivity Test from Extension

The popup should display:

```text
Backend
Connected
```

against:

```text
https://ai-powered-chrome-extension-api.vercel.app/api/health
```

This proves:

```text
Chrome Extension
      ↓
Vercel
      ↓
MongoDB Atlas
```

is functioning.

---

# 36. Production Bundle URL Test

Search generated extension JavaScript for:

```text
ai-powered-chrome-extension-api.vercel.app
```

This confirms the production backend URL is actually present in the compiled bundle rather than only in unbuilt source.

---

# 37. Workday Detection Test

On a normal website:

```text
Workday page
Not detected
```

is expected.

On:

```text
*.myworkdayjobs.com
```

or:

```text
*.workday.com
```

the extension should report Workday detection.

This prevents Workday automation from running on unrelated pages.

---

# 38. Active Workday Tab Test

When a Workday-specific command is triggered without an active Workday page:

Expected:

```text
Open a Workday page first.
```

or equivalent controlled error.

No DOM action should occur on the wrong site.

---

# 39. Content Script Availability Test

If the extension is installed after a Workday page was already open, the content script may not yet exist in that tab until refresh.

The system should return a controlled communication error rather than crash.

---

# 40. DOM Scanner Tests

The scanner should identify fields such as:

```text
text input
email
telephone
textarea
select
radio
checkbox
date-like field
```

The normalized result should preserve field metadata used by mapping.

---

# 41. Label Resolution Test

Labels may come from:

```text
<label>
aria-label
aria-labelledby
placeholder
nearby text
```

Test fixtures should cover multiple label strategies.

---

# 42. Required Field Detection

For:

```html
<input required>
```

or equivalent Workday-required controls, scanner metadata should reflect that the field is mandatory when detectable.

---

# 43. Existing Value Detection

A prefilled input should expose its current value.

This metadata is essential for safe autofill.

---

# 44. Semantic Mapping Tests

Known examples should map deterministically.

```text
First Name → firstName
Legal First Name → firstName
Last Name → lastName
Surname → lastName
Email Address → email
Phone Number → phone
```

---

# 45. Mapping Output Test

Mapping results should contain sufficient information for later fill decisions.

Typical properties:

```text
fieldId
label
kind
targetPath
value
confidence
shouldFill
```

---

# 46. Confidence Test

High confidence mapping:

```text
confidence >= safe threshold
shouldFill = true
```

Ambiguous mapping:

```text
confidence too low
shouldFill = false
```

This confirms confidence actually affects automation.

---

# 47. Safe Autofill Test

Only mappings satisfying safety criteria should be converted into autofill instructions.

Conceptually:

```text
shouldFill
AND
value exists
AND
targetPath exists
AND
confidence >= threshold
```

---

# 48. Prefilled Value Protection Test

Scenario:

```text
Workday field already contains valid text
```

Expected:

```text
extension skips unnecessary overwrite
```

This is one of the most important regression cases.

---

# 49. DOM Event Test

After modifying a field, the extension should dispatch the events required for Workday/framework state to detect the change.

Examples:

```text
input
change
blur
```

Tests should verify state updates occur after filling.

---

# 50. Checkbox Test

A checkbox should be changed through checkbox semantics rather than being treated as a text field.

Tests should verify:

```text
checked state
change event
```

where applicable.

---

# 51. Radio Test

Radio controls should be matched and selected safely.

A value should not be selected merely because it is the first available radio option.

---

# 52. Dropdown Test

Native dropdown behavior should be tested separately from text input behavior.

Custom Workday dropdowns may require manual integration testing because they can differ from native HTML `<select>` elements.

---

# 53. Dynamic Section Test

Simulate delayed DOM insertion.

Example:

```text
Add Experience clicked
       ↓
DOM changes after delay
       ↓
MutationObserver detects new section
```

The system should recognize that a new repeatable section has been created.

---

# 54. Experience Repeatable Test

Scenario:

```text
Candidate = 3 experiences
Workday = 1 experience section
```

Expected process:

```text
detect missing sections
create sections
wait for rendering
fill each corresponding experience
```

---

# 55. Education Repeatable Test

The same structure applies to Education.

The system should not place all education records into a single Workday education entry.

---

# 56. Navigation Detection Test

The navigator should identify controls such as:

```text
Continue
Next
Back
```

without confusing unrelated buttons.

---

# 57. Continue Navigation Test

Navigation should occur only after required safety conditions are satisfied.

Autofill and validation are separate from navigation.

---

# 58. Back Navigation Test

The extension should identify and trigger an appropriate previous-step control when supported.

---

# 59. Question Detection Test

Application questions should be detected separately from ordinary profile fields.

Possible classifications:

```text
Yes / No
Authorization
Sponsorship
Custom
Sensitive
Unknown
```

---

# 60. Sensitive Question Regression Test

Examples:

```text
gender
race
ethnicity
disability
veteran status
```

If candidate information does not explicitly provide these values:

Expected:

```text
do not infer
do not autofill
```

---

# 61. Sponsorship Test

If sponsorship status is not part of the structured candidate profile:

Expected:

```text
manual review
```

rather than AI assumption.

---

# 62. Validation Scan Test

Validation should detect:

- visible error text,
- invalid controls,
- missing required values,
- incomplete autofill results.

Blocking issues should prevent automatic progression.

---

# 63. Error Recovery Test

Simulate:

```text
field disappears
content script unavailable
backend request fails
candidate missing
mapping fails
```

Expected:

```text
controlled error returned
no uncontrolled next-step action
```

---

# 64. Final Review Detection Test

At the final Workday review page, the extension should be able to trigger the review scanner.

No final submission should happen merely because Review has been detected.

---

# 65. Explicit Submission Guard Test

Input:

```text
explicitlyConfirmed = false
```

Expected:

```text
submission rejected
```

Input:

```text
explicitlyConfirmed = true
```

Only then is submission eligible to proceed.

This is a critical safety test.

---

# 66. Authentication Safety Test

The extension must never attempt to bypass:

```text
login
CAPTCHA
MFA
OTP
security challenge
```

Such flows must remain manually controlled.

---

# 67. Regression Test Focus

Phase 14 focuses on ensuring later development does not break core safety guarantees.

Important regression areas include:

- prefilled field protection,
- confidence thresholds,
- Workday tab validation,
- candidate ID validation,
- dynamic rendering,
- repeatable sections,
- sensitive questions,
- validation failures,
- explicit submission confirmation.

---

# 68. Manual End-to-End Test

Recommended complete flow:

```text
1. Upload PDF or DOCX.
2. Extract resume text.
3. Parse resume through Gemini.
4. Verify candidate JSON.
5. Verify candidate persisted in MongoDB.
6. Copy candidate ID.
7. Open Chrome extension.
8. Save candidate ID.
9. Verify Backend Connected.
10. Open supported Workday page.
11. Verify Workday detected.
12. Scan page.
13. Inspect discovered fields.
14. Map fields.
15. Review confidence.
16. Autofill safe fields.
17. Verify prefilled values were preserved.
18. Detect dynamic sections.
19. Fill Experience and Education.
20. Detect navigation.
21. Validate current step.
22. Continue.
23. Detect questions.
24. Manually review uncertain or sensitive questions.
25. Validate each step.
26. Reach final Review.
27. Scan final review.
28. Inspect application.
29. Explicitly confirm submission.
30. Submit only after confirmation.
```

---

# 69. Production Acceptance Criteria

Before final delivery, verify:

```text
Backend build passes
Backend typecheck passes
Extension build passes
No secret is staged
Production API responds
MongoDB connected
PDF parsing works
DOCX parsing works
Gemini parsing works
Candidate persistence works
Candidate retrieval works
Invalid candidate IDs are safe
Extension loads
Manifest is valid
Service worker loads
Backend status is Connected
Workday detection works
DOM scanning works
Mapping works
Confidence gates filling
Prefilled values are protected
Dynamic sections work
Experience/Education work
Navigation works
Question detection works
Sensitive fields remain unresolved
Validation works
Review scan works
Submission requires explicit confirmation
```

---

# 70. Final Testing Philosophy

The goal of testing is not merely:

> Can the application automatically fill a Workday form?

The real goal is:

> Can the application correctly determine when it should fill, when it should stop, when it should ask the user, and when it must refuse to take an irreversible action?

The project's testing philosophy is therefore:

> **A controlled safe failure is preferable to an incorrect automated job application.**
