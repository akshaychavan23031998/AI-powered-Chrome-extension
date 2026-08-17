# System Architecture

## 1. Overview

The Workday AI Application Assistant is an AI-assisted Chrome extension designed to understand a candidate's resume and safely automate repetitive parts of Workday job applications.

The system is not designed as a blind form-filling bot.

Instead, it follows a controlled pipeline:

```text
Understand Candidate
        ↓
Understand Workday Page
        ↓
Map Candidate Data to Fields
        ↓
Evaluate Confidence
        ↓
Autofill Safe Fields
        ↓
Validate
        ↓
Navigate
        ↓
Review
        ↓
Explicit User Confirmation
        ↓
Submit
```

The project is implemented as a monorepo containing:

1. a Node.js + Express backend,
2. a React + TypeScript Chrome extension,
3. shared packages,
4. testing infrastructure,
5. project documentation.

The major architectural principle is:

> **Heuristics first, AI second, and user review whenever confidence is insufficient.**

---

# 2. High-Level Architecture

```text
                              ┌──────────────────────┐
                              │ Candidate │
                              │ Resume │
                              │ PDF / DOCX │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ Resume Parser │
                              │ │
                              │ PDF → pdfjs-dist │
                              │ DOCX → mammoth │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ Extracted Text │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ Google Gemini │
                              │ Resume Understanding │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ Structured Candidate │
                              │ JSON │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ Zod Validation │
                              │ + Normalization │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ MongoDB Atlas │
                              │ Candidate Persistence│
                              └──────────┬───────────┘
                                         │
                                         │ Candidate ID
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Chrome Extension │
│ │
│ React Popup │
│ │ │
│ ▼ │
│ Background Service Worker │
│ │ │
│ ├──────────── Backend API │
│ │ │
│ ▼ │
│ Content Script │
│ │ │
│ ▼ │
│ Workday DOM │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │ Workday Scanner │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Semantic Mapper │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Safe Autofill │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Dynamic / Repeatable │
                    │ Section Handling │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Question Scanner │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Validation │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Navigation │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Final Review │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Explicit User │
                    │ Confirmation │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Submit │
                    └──────────────────────┘
```

---

# 3. Repository Architecture

The repository uses npm workspaces.

```text
AI-powered Chrome extension/
│
├── apps/
│ │
│ ├── api/
│ │ ├── src/
│ │ │ ├── config/
│ │ │ ├── controllers/
│ │ │ ├── middleware/
│ │ │ ├── models/
│ │ │ ├── prompts/
│ │ │ ├── routes/
│ │ │ ├── schemas/
│ │ │ ├── services/
│ │ │ ├── types/
│ │ │ ├── utils/
│ │ │ ├── app.ts
│ │ │ └── server.ts
│ │ │
│ │ ├── .env.example
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ └── extension/
│ ├── public/
│ │ └── manifest.json
│ │
│ ├── src/
│ │ ├── background/
│ │ ├── components/
│ │ ├── content/
│ │ ├── lib/
│ │ ├── types/
│ │ ├── App.tsx
│ │ └── main.tsx
│ │
│ ├── dist/
│ ├── package.json
│ ├── tsconfig.app.json
│ └── vite.config.ts
│
├── packages/
│ ├── shared-types/
│ └── shared-schemas/
│
├── docs/
│ ├── architecture.md
│ ├── ai-strategy.md
│ ├── testing.md
│ └── limitations.md
│
├── tests/
│ ├── e2e/
│ ├── fixtures/
│ └── integration/
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

# 4. Backend Architecture

The backend is responsible for:

- runtime configuration,
- MongoDB connectivity,
- resume upload validation,
- PDF parsing,
- DOCX parsing,
- Gemini communication,
- AI output validation,
- candidate normalization,
- candidate persistence,
- candidate retrieval,
- semantic mapping support,
- global error handling,
- health reporting.

The backend follows a layered structure:

```text
HTTP Request
    ↓
Route
    ↓
Controller
    ↓
Service
    ↓
Schema / Model
    ↓
External Dependency
```

External dependencies include:

```text
MongoDB Atlas
Google Gemini
PDF.js
Mammoth
```

This separation keeps controllers small and prevents business logic from being mixed with HTTP concerns.

---

# 5. Express Application Architecture

The Express application is defined in:

```text
apps/api/src/app.ts
```

Responsibilities include:

- configuring CORS,
- parsing JSON,
- parsing URL-encoded requests,
- ensuring MongoDB connectivity,
- registering routes,
- handling unmatched routes,
- forwarding errors to centralized middleware.

Local startup is performed through:

```text
apps/api/src/server.ts
```

The local lifecycle is:

```text
server.ts
   ↓
connectDatabase()
   ↓
app.listen()
```

Vercel loads the Express application through:

```text
app.ts
```

Therefore the deployed request path ensures that MongoDB is connected before backend routes execute.

---

# 6. MongoDB Connection Architecture

MongoDB Atlas is used as the persistent database.

The MongoDB connection service handles:

- initial connection,
- already-connected state,
- concurrent connection reuse,
- failed connection reset,
- disconnection.

The application avoids opening a completely new connection for every incoming request when the serverless runtime can reuse an existing instance.

Conceptually:

```text
Request
   ↓
MongoDB already connected?
   ├── Yes → continue
   │
   └── No
        ↓
Existing connection promise?
   ├── Yes → wait for it
   │
   └── No → create connection
```

This is important for both local development and Vercel's serverless execution model.

---

# 7. Environment Configuration

Runtime configuration is validated through Zod.

Important environment variables include:

```text
NODE_ENV
PORT
MONGODB_URI
GEMINI_API_KEY
GEMINI_MODEL
CLIENT_ORIGIN
```

Example local configuration:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
CLIENT_ORIGIN=http://localhost:5173
```

Secrets are never hardcoded into the Chrome extension.

---

# 8. Resume Upload Architecture

Resume uploads are handled through multipart form data.

The upload layer validates:

- whether a file exists,
- maximum file size,
- supported file type,
- supported filename extension.

Supported formats:

```text
PDF
DOCX
```

The resume is processed in memory rather than written permanently to the backend filesystem.

---

# 9. PDF Resume Parsing

PDF parsing uses:

```text
pdfjs-dist
```

Conceptual flow:

```text
PDF Buffer
    ↓
PDF Document
    ↓
Page 1 text
Page 2 text
...
    ↓
Combined Raw Text
    ↓
Whitespace Normalization
```

PDF extraction may produce formatting artifacts because visual PDF layout and logical text order are not always the same.

Examples include:

```text
A KSHAY R AM C HAVAN
```

or broken spacing around icons and links.

These artifacts are later handled conservatively by the AI understanding layer.

---

# 10. DOCX Resume Parsing

DOCX parsing uses:

```text
mammoth
```

Conceptual flow:

```text
DOCX Buffer
     ↓
Mammoth extractRawText()
     ↓
Raw Text
     ↓
Normalization
```

Some Windows uploads can identify DOCX files as:

```text
application/octet-stream
```

Therefore safe extension-based fallback is supported in addition to MIME-type validation.

---

# 11. AI Resume Understanding Architecture

Resume parsing and AI understanding are deliberately separate.

The parser answers:

> What text exists inside this document?

Gemini answers:

> What structured candidate information does this text represent?

Pipeline:

```text
Resume File
    ↓
Parser
    ↓
Raw Resume Text
    ↓
Gemini Prompt
    ↓
Structured JSON
    ↓
Zod Validation
    ↓
Normalizer
    ↓
Candidate Profile
```

This prevents raw Gemini output from entering the database without deterministic validation.

---

# 12. Gemini Structured Candidate Layer

Gemini returns a predictable candidate structure containing information such as:

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

A Gemini-specific schema validates the model response.

The application then normalizes that structure into the main candidate domain model.

---

# 13. Candidate Normalization

Normalization handles differences between model-friendly output and application-friendly data.

Examples:

```text
"" → undefined
```

for optional scalar values.

Duplicate skills are removed case-insensitively.

Current employment may be normalized to:

```text
current = true
endDate = null
```

Empty work experience or education entries can be filtered when they do not contain meaningful identifying information.

---

# 14. Candidate Persistence

Validated candidates are stored using Mongoose.

A candidate can include:

```text
Identity
Contact information
Location
Profile links
Summary
Skills
Experience[]
Education[]
Certifications[]
Resume metadata
```

Resume metadata can include:

```text
fileName
mimeType
fileSize
extractedText
```

MongoDB generates a unique candidate identifier.

Example:

```text
6a80b0cf3963d566352325e8
```

The Chrome extension can use this identifier to work with a specific candidate.

---

# 15. Candidate Retrieval

The candidate API validates MongoDB ObjectIds before querying.

Invalid IDs produce a controlled client error instead of a Mongoose CastError reaching the generic 500 handler.

Conceptually:

```text
candidateId
    ↓
Valid ObjectId?
    ├── No → 400 Invalid candidate ID
    │
    └── Yes
         ↓
      MongoDB
```

---

# 16. Chrome Extension Architecture

The Chrome extension uses Manifest V3.

Major pieces:

```text
React Popup
Background Service Worker
Content Script
chrome.storage.local
chrome.runtime messaging
chrome.tabs
```

Each piece has a separate responsibility.

---

# 17. React Popup

The popup is the primary user control surface.

It presents:

- backend connectivity,
- Workday detection,
- candidate ID,
- scanning actions,
- mapping actions,
- safe autofill,
- dynamic section detection,
- Experience/Education autofill,
- navigation detection,
- question detection,
- validation,
- final review.

The popup does not directly manipulate the Workday DOM.

Instead:

```text
Popup
   ↓
chrome.runtime.sendMessage()
   ↓
Background Service Worker
```

This keeps orchestration centralized.

---

# 18. Background Service Worker

The background service worker acts as the extension coordinator.

Responsibilities include:

- backend health requests,
- candidate state,
- finding the active browser tab,
- validating that the current tab is Workday,
- sending messages to the Workday content script,
- calling backend mapping APIs,
- coordinating autofill,
- coordinating navigation,
- coordinating validation,
- coordinating final review,
- coordinating submission safety.

---

# 19. Chrome Storage

Manifest V3 service workers are not guaranteed to remain alive continuously.

Therefore state is stored in:

```text
chrome.storage.local
```

rather than only in JavaScript module variables.

Stored state may include:

```text
backendConnected
workdayDetected
candidateId
candidate information
other extension state
```

This allows state to survive service-worker suspension.

---

# 20. Content Script Architecture

The content script runs on supported Workday domains.

Supported patterns include:

```text
https://*.myworkdayjobs.com/*
https://*.workday.com/*
```

The content script is responsible for interacting with Workday's DOM.

It handles:

- field discovery,
- labels,
- selectors,
- field filling,
- event simulation,
- dynamic-section scanning,
- repeatable sections,
- navigation scanning,
- question scanning,
- validation scanning,
- review scanning,
- submission action after explicit confirmation.

---

# 21. Workday Page Detection

Before automation begins, the extension checks whether the active tab belongs to a supported Workday host.

Conceptually:

```text
Active Tab
   ↓
URL available?
   ↓
Contains supported Workday hostname?
   ├── Yes → Workday detected
   └── No → Disable Workday actions
```

This prevents Workday-specific automation from running on unrelated websites.

---

# 22. DOM Scanner

The DOM scanner transforms Workday controls into normalized metadata.

Instead of storing only an HTML element, the scanner attempts to understand:

```text
id
name
type
label
placeholder
aria-label
aria-labelledby
required
existing value
disabled
readonly
surrounding context
control kind
selector hint
```

This normalized representation is used by the mapper and filler.

---

# 23. Label Discovery

Field semantics are not always stored in a single `<label>` element.

The scanner may inspect:

```text
<label for="...">
aria-label
aria-labelledby
placeholder
nearby text
container text
```

The goal is to construct the strongest useful semantic description possible.

---

# 24. Field Classification

Supported field categories include:

```text
text
email
telephone
textarea
select
date
radio
checkbox
file
```

Custom Workday components may require additional interaction beyond standard native HTML behavior.

---

# 25. Semantic Mapping Architecture

Workday fields and candidate profile paths rarely use identical names.

Example:

```text
Workday:
Legal First Name

Candidate:
firstName
```

The mapping layer produces information such as:

```json
{
  "fieldId": "...",
  "label": "Legal First Name",
  "targetPath": "firstName",
  "value": "Akshay",
  "confidence": 0.98,
  "shouldFill": true
}
```

This creates an explicit interpretation layer between candidate information and page mutation.

---

# 26. Heuristic-First Mapping

Known common fields should not require AI.

Examples:

```text
First Name → firstName
Last Name → lastName
Email → email
Phone → phone
City → location.city
```

Deterministic mapping provides:

- faster execution,
- lower AI usage,
- higher predictability,
- easier debugging.

AI becomes useful when deterministic mapping cannot confidently resolve semantics.

---

# 27. Confidence-Based Mapping

Mappings include confidence.

Conceptually:

```text
High confidence
    ↓
Eligible for safe autofill

Medium confidence
    ↓
Review preferred

Low confidence
    ↓
Do not autofill
```

Automation is therefore not based only on whether a value exists.

It also considers whether the mapping itself is reliable.

---

# 28. Safe Autofill Engine

The filler receives instructions generated by the mapping stage.

It does not independently guess candidate data.

Before filling, the system considers:

```text
shouldFill
confidence
candidate value exists?
field exists?
existing value?
field disabled?
field readonly?
supported field kind?
```

---

# 29. Prefilled Value Protection

A key requirement is preserving valid existing values.

Workday may already contain values from:

- previous applications,
- Workday profile data,
- browser autofill,
- user input.

The extension should avoid replacing those values unnecessarily.

This protects candidate data and reduces destructive automation.

---

# 30. DOM Event Simulation

Changing `element.value` alone is often not enough for modern frontend applications.

The filler may dispatch browser events such as:

```text
input
change
blur
```

so that Workday's client-side state recognizes the modification.

---

# 31. Dynamic Rendering

Workday frequently modifies the page after initial load.

Examples:

- moving to another step,
- adding Experience,
- adding Education,
- expanding sections,
- displaying errors,
- loading dropdowns.

The extension uses:

```text
MutationObserver
```

and controlled waiting strategies to detect DOM changes.

---

# 32. Repeatable Section Architecture

Work experience and education are collections rather than single fields.

Conceptual process:

```text
Candidate Experience Count
         ↓
Existing Workday Experience Sections
         ↓
Enough sections?
    ├── Yes → Fill
    │
    └── No
         ↓
      Add Entry
         ↓
      Wait for DOM
         ↓
      Re-scan
         ↓
      Fill
```

The same overall approach applies to Education.

---

# 33. Multi-Step Navigation Architecture

Workday application workflows typically contain multiple pages.

The navigator is intentionally separated from autofill.

This means:

```text
Filler
```

does not automatically decide:

```text
Next / Continue
```

without navigation logic.

Navigation can detect controls such as:

```text
Continue
Next
Back
Review
```

and determine the current workflow state.

---

# 34. Question Detection

Application questions require different treatment from standard contact fields.

The system can classify questions into categories such as:

```text
Yes / No
Work authorization
Sponsorship
Custom question
Sensitive voluntary disclosure
Unknown
```

Question handling remains conservative when candidate information is unavailable.

---

# 35. Sensitive Questions

The system must not infer unknown sensitive information.

Examples include:

```text
gender
race
ethnicity
disability
veteran status
religion
health information
other voluntary disclosures
```

These values are left for manual candidate input when not explicitly known.

---

# 36. Validation Architecture

After filling, the application should validate the current Workday step before moving forward.

Validation may inspect:

```text
required controls
visible errors
invalid states
missing mandatory values
failed fill results
```

Conceptually:

```text
Autofill
   ↓
Validation Scan
   ↓
Blocking issue?
   ├── Yes → stop and review
   └── No → navigation allowed
```

---

# 37. Error Recovery

Automation failures should be reported rather than silently ignored.

Examples include:

```text
No active tab
Not a Workday page
Content script unavailable
Field disappeared
Backend unavailable
Candidate lookup failed
Mapping API failed
Dynamic section did not render
Validation failed
```

The extension attempts to return controlled status information to the popup.

---

# 38. Final Review Architecture

Final Review is treated as its own phase.

The extension can scan the final review state before submission.

The expected process is:

```text
Final Review Page
      ↓
Review Scan
      ↓
Candidate inspects application
      ↓
Explicit confirmation
      ↓
Submission action
```

---

# 39. Submission Guard

Submission is protected by an explicit boolean confirmation.

Conceptually:

```ts
if (explicitlyConfirmed !== true) {
  rejectSubmission();
}
```

This prevents silent or accidental final application submission.

---

# 40. Authentication Boundary

The extension does not attempt to bypass:

```text
Workday authentication
CAPTCHA
MFA
OTP
security challenges
email verification
```

The user handles authentication manually.

Automation operates only after the user has legitimately reached the relevant application pages.

---

# 41. Production Deployment Architecture

The backend is deployed at:

```text
https://ai-powered-chrome-extension-api.vercel.app
```

The production health endpoint is:

```text
https://ai-powered-chrome-extension-api.vercel.app/api/health
```

Production architecture:

```text
Chrome Extension
      ↓ HTTPS
Vercel Express API
      ↓
MongoDB Atlas

Vercel Express API
      ↓
Google Gemini
```

---

# 42. Chrome Extension Production Connection

The extension build contains the production API base URL.

The extension manifest includes the Vercel backend in:

```text
host_permissions
```

The production extension therefore does not require the local Express server to be running.

---

# 43. Local vs Production Architecture

## Local

```text
Chrome Extension / Dev Tools
      ↓
http://localhost:4000
      ↓
Local Express
      ↓
MongoDB Atlas
```

## Production

```text
Chrome Extension
      ↓
https://ai-powered-chrome-extension-api.vercel.app
      ↓
Vercel
      ↓
MongoDB Atlas
```

---

# 44. Security Architecture

Secrets remain server-side.

The extension must never contain:

```text
GEMINI_API_KEY
MONGODB_URI credentials
```

Security boundary:

```text
Browser
   ↓
Public Backend API
   ↓
Backend Secrets
   ├── MongoDB
   └── Gemini
```

---

# 45. Architectural Design Principles

## Separation of concerns

Each module has a narrow responsibility.

## Validate external intelligence

AI-generated data is never trusted automatically.

## Deterministic before probabilistic

Known mappings should use deterministic logic.

## Preserve candidate control

Authentication and final submission remain user-controlled.

## Safe failure

When the system cannot establish confidence, it should stop rather than guess.

## Protect secrets

All service credentials remain on the backend.

## Avoid destructive automation

Existing valid form values should not be overwritten unnecessarily.

---

# 46. Final Architecture Summary

The complete pipeline is:

```text
Resume
 ↓
PDF / DOCX Parser
 ↓
Raw Text
 ↓
Gemini
 ↓
Structured Candidate JSON
 ↓
Zod
 ↓
Normalizer
 ↓
MongoDB Atlas
 ↓
Candidate ID
 ↓
Chrome Extension
 ↓
Workday Detection
 ↓
DOM Scanner
 ↓
Semantic Mapper
 ↓
Confidence Evaluation
 ↓
Safe Autofill
 ↓
Dynamic / Repeatable Sections
 ↓
Questions
 ↓
Validation
 ↓
Navigation
 ↓
Final Review
 ↓
Explicit Confirmation
 ↓
Submit
```

The architecture is intentionally designed around one final rule:

> **Automate only what the system can justify with sufficient confidence, and return control to the user whenever certainty is insufficient.**

