# Workday AI Application Assistant

AI-powered Chrome extension for understanding a candidate's resume and safely assisting with Workday job applications.

The system combines:

- Chrome Extension — Manifest V3
- React + TypeScript
- Node.js + Express
- MongoDB Atlas
- Google Gemini
- PDF and DOCX resume processing
- Structured candidate profile generation
- Automatic candidate onboarding
- Semantic Workday field mapping
- Workday DOM automation
- Confidence-aware safe autofill
- Dynamic/repeatable section handling
- Multi-step navigation
- Validation and error recovery
- Final review
- Explicit user confirmation before submission

> **Core principle:** Heuristics first, AI second, user review when uncertain.

---

# 🚀 Latest Release

## Workday AI Application Assistant v1.0.0

The packaged Chrome extension is available as a free GitHub Release.

### Download

[Download Workday AI Application Assistant v1.0.0](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/releases/tag/v1.0.0)

Release asset:

```text
workday-ai-assistant-v1.0.0.zip
```

The extension is currently distributed through GitHub rather than the Chrome Web Store.

Chrome **Developer Mode** is therefore required for installation.

---

# 📦 Install the Chrome Extension

## Option 1 — GitHub Release

1. Open the latest GitHub Release:

   [Workday AI Application Assistant v1.0.0](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/releases/tag/v1.0.0)

2. Download:

   ```text
   workday-ai-assistant-v1.0.0.zip
   ```

3. Extract the ZIP.

4. Open Google Chrome.

5. Visit:

   ```text
   chrome://extensions
   ```

6. Enable:

   ```text
   Developer mode
   ```

7. Click:

   ```text
   Load unpacked
   ```

8. Select the extracted extension directory containing:

   ```text
   manifest.json
   background.js
   content.js
   index.html
   assets/
   icons/
   ```

9. Pin **Workday AI Application Assistant** to the Chrome toolbar.

---

## Option 2 — Build from Source

Clone the repository:

```bash
git clone https://github.com/akshaychavan23031998/AI-powered-Chrome-extension.git
```

Enter the project:

```bash
cd "AI-powered-Chrome-extension"
```

Install dependencies:

```bash
npm install
```

Build the extension:

```bash
npm run build:extension
```

Then load:

```text
apps/extension/dist
```

through:

```text
chrome://extensions
→ Developer mode
→ Load unpacked
```

---

# 🌐 Live Links

## Production Backend

[https://ai-powered-chrome-extension-api.vercel.app](https://ai-powered-chrome-extension-api.vercel.app)

## Health Endpoint

[https://ai-powered-chrome-extension-api.vercel.app/api/health](https://ai-powered-chrome-extension-api.vercel.app/api/health)

A healthy deployment returns a response similar to:

```json
{
  "success": true,
  "service": "workday-ai-api",
  "status": "healthy",
  "database": "connected"
}
```

---

## GitHub Repository

[AI-powered Chrome Extension](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension)

---

## GitHub Release

[Workday AI Application Assistant v1.0.0](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/releases/tag/v1.0.0)

---

## Privacy Policy

[PRIVACY_POLICY.md](./PRIVACY_POLICY.md)

---

## Portfolio

[Akshay Chavan — Portfolio](https://akshay-chavan-portfolio.vercel.app/)

---

# 🎥 Demo Video

```text
Coming soon
```

The final demo will cover:

1. GitHub Release installation
2. Loading the extension in Chrome
3. Uploading a PDF resume
4. AI-powered candidate profile creation
5. Candidate profile persistence
6. Workday page detection
7. DOM scanning
8. Semantic field mapping
9. Safe autofill
10. Dynamic Experience and Education sections
11. Question detection
12. Validation
13. Navigation
14. Final review
15. Explicit submission confirmation

---

# Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Solution](#solution)
4. [Core Features](#core-features)
5. [Technology Stack](#technology-stack)
6. [High-Level Architecture](#high-level-architecture)
7. [End-to-End Flow](#end-to-end-flow)
8. [AI Strategy](#ai-strategy)
9. [Resume Parsing](#resume-parsing)
10. [Candidate Onboarding](#candidate-onboarding)
11. [Candidate Profile](#candidate-profile)
12. [Chrome Extension Architecture](#chrome-extension-architecture)
13. [Workday DOM Automation](#workday-dom-automation)
14. [Semantic Field Mapping](#semantic-field-mapping)
15. [Safe Autofill](#safe-autofill)
16. [Dynamic and Repeatable Sections](#dynamic-and-repeatable-sections)
17. [Multi-Step Navigation](#multi-step-navigation)
18. [Questions and EEO Handling](#questions-and-eeo-handling)
19. [Validation and Error Recovery](#validation-and-error-recovery)
20. [Review and Submission Safety](#review-and-submission-safety)
21. [Repository Structure](#repository-structure)
22. [Local Development Setup](#local-development-setup)
23. [Environment Variables](#environment-variables)
24. [Running the Backend](#running-the-backend)
25. [Building the Chrome Extension](#building-the-chrome-extension)
26. [Loading the Extension in Chrome](#loading-the-extension-in-chrome)
27. [Backend API](#backend-api)
28. [Production Deployment](#production-deployment)
29. [Testing](#testing)
30. [Security and Privacy](#security-and-privacy)
31. [Phase-by-Phase Development History](#phase-by-phase-development-history)
32. [Known Limitations](#known-limitations)
33. [Future Improvements](#future-improvements)
34. [Demo Flow](#demo-flow)
35. [Final Submission Checklist](#final-submission-checklist)
36. [Important Development Commands](#important-development-commands)
37. [Engineering Principles](#engineering-principles)
38. [Author](#author)

---

# Project Overview

The **Workday AI Application Assistant** is an AI-powered Chrome extension designed to reduce repetitive work involved in completing Workday job applications.

Instead of blindly filling form fields, the system first understands the candidate from their resume.

The workflow is:

```text
Resume
   ↓
PDF / DOCX extraction
   ↓
Google Gemini
   ↓
Structured Candidate Profile
   ↓
Zod Validation
   ↓
MongoDB
   ↓
Chrome Extension
   ↓
Workday DOM Scanner
   ↓
Semantic Field Mapper
   ↓
Safe Autofill
   ↓
Validation
   ↓
Navigation
   ↓
Final Review
   ↓
Explicit User Confirmation
```

The system:

1. accepts a PDF or DOCX resume directly through the Chrome extension,
2. uploads it to the backend,
3. extracts readable resume text,
4. sends the extracted text to Google Gemini,
5. converts unstructured resume content into structured candidate JSON,
6. validates and normalizes that data,
7. stores the profile in MongoDB,
8. automatically stores the returned candidate reference inside the extension,
9. displays a user-friendly Candidate Profile,
10. scans a Workday application page,
11. understands the semantic meaning of fields,
12. maps candidate information to those fields,
13. fills only sufficiently confident and safe mappings,
14. avoids unnecessary overwriting of valid prefilled values,
15. handles dynamic sections and multi-step workflows,
16. pauses for uncertain or sensitive questions,
17. validates the current step,
18. scans the final review,
19. requires explicit user confirmation before submission.

The goal is not uncontrolled browser automation.

The goal is:

> **Safe, explainable, resume-aware job application assistance while keeping the candidate in control.**

---

# Problem Statement

Job applicants repeatedly enter similar information across Workday applications:

- first name
- middle name
- last name
- email
- phone
- location
- LinkedIn
- GitHub
- portfolio
- work experience
- education
- skills
- certifications
- employment dates
- application questions

Traditional browser autofill is not sufficient because Workday forms are dynamic and semantically inconsistent.

---

## 1. Different Field Wording

The same information may appear as:

```text
First Name
Given Name
Legal First Name
Preferred First Name
```

A selector-only autofill system cannot reliably understand these differences.

---

## 2. Dynamic Forms

Workday frequently renders content asynchronously.

Fields may appear after:

- page transitions
- button clicks
- modal interactions
- section expansion
- repeatable item creation
- asynchronous rendering

---

## 3. Multi-Step Workflows

Applications may contain:

```text
My Information
Experience
Education
Application Questions
Voluntary Disclosures
Review
```

Automation therefore requires awareness of the current application step.

---

## 4. Repeatable Sections

Experience and education are collections rather than single fields.

Example:

```text
Experience 1
Experience 2
Experience 3
...
```

The extension needs to inspect existing entries and safely create additional entries when appropriate.

---

## 5. Sensitive Questions

Some information should never be guessed.

Examples include:

- disability status
- veteran status
- gender
- race or ethnicity
- voluntary demographic disclosures
- legal declarations
- sponsorship information when unknown

The extension uses conservative handling for these fields.

---

## 6. Final Submission Is Irreversible

The extension must not silently submit an application.

The required workflow is:

```text
Final Review
      ↓
Explicit User Confirmation
      ↓
Submit
```

---

# Solution

The project contains two main applications.

```text
┌─────────────────────────────────────────┐
│            Chrome Extension             │
│                                         │
│ React Popup                             │
│ Resume Onboarding                       │
│ Background Service Worker               │
│ Content Script                          │
│ Workday Scanner                         │
│ Semantic Mapper                         │
│ Safe Autofill Engine                    │
│ Repeatable Section Handler              │
│ Navigator                               │
│ Validator                               │
│ Final Review                            │
│ Submission Guard                        │
└───────────────────┬─────────────────────┘
                    │
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────┐
│               Backend API               │
│                                         │
│ Node.js                                 │
│ Express                                 │
│ TypeScript                              │
│ Resume Upload                           │
│ PDF / DOCX Parser                       │
│ Gemini Integration                      │
│ Candidate Service                       │
│ Field Mapping API                       │
└───────────────────┬─────────────────────┘
                    │
             ┌──────┴───────┐
             │              │
             ▼              ▼
       MongoDB Atlas   Google Gemini
```

---

# Core Features

## Resume Upload from the Extension

Users can upload:

```text
PDF
DOCX
```

directly from the Chrome extension popup.

No MongoDB Candidate ID needs to be manually entered.

---

## Resume Processing

Includes:

- PDF support
- DOCX support
- MIME/extension detection
- file validation
- file-size protection
- raw text extraction
- whitespace normalization
- structured resume metadata

---

## AI Resume Understanding

Google Gemini converts unstructured resume text into structured candidate information.

Potential extracted data includes:

- first name
- middle name
- last name
- email
- phone
- location
- summary
- LinkedIn
- GitHub
- portfolio
- skills
- work experience
- education
- certifications

---

## Candidate Persistence

Candidate profiles flow through:

```text
Resume
   ↓
Parser
   ↓
Gemini
   ↓
Zod
   ↓
Normalizer
   ↓
Mongoose
   ↓
MongoDB Atlas
```

---

## Automatic Candidate Onboarding

After resume processing succeeds:

```text
Backend
   ↓
Candidate created
   ↓
Internal candidateId returned
   ↓
chrome.storage.local
   ↓
Candidate Profile shown in popup
```

Users do not need to:

```text
Copy a MongoDB ObjectId
Paste a Candidate ID
Manage database identifiers
```

---

## Candidate Profile UI

The popup can display a friendly summary such as:

```text
Candidate Profile

✓ Resume ready

AKSHAY RAM CHAVAN

Software Development Engineer I

candidate@example.com

React.js · Next.js · TypeScript · JavaScript

Resume: candidate-resume.pdf

Replace Resume
```

---

## Resume Replacement

Users can select:

```text
Replace Resume
```

and process a new PDF or DOCX resume.

For v1, processing a replacement resume creates a new candidate profile and updates the candidate reference stored by the extension.

---

## Workday Detection

Supported host patterns include:

```text
*.myworkdayjobs.com
*.workday.com
```

The popup reports whether the active page is recognized as a supported Workday page.

---

## DOM Scanner

The extension scans controls including:

- input
- textarea
- select
- radio
- checkbox
- date-like controls
- labels
- ARIA metadata
- buttons
- repeatable sections

---

## Semantic Mapping

The mapping engine considers:

```text
Field label
Field type
Field description
Placeholder
ARIA labels
Candidate profile
Existing value
```

Deterministic mapping is attempted first.

AI is used when semantic interpretation is required.

---

## Safe Autofill

Autofill considers:

```text
candidate value
confidence
shouldFill
field type
existing value
sensitivity
```

The system prefers leaving a field untouched rather than filling an uncertain value.

---

## Dynamic Workday Support

Includes support for:

- delayed rendering
- MutationObserver
- dynamic field appearance
- repeatable Experience sections
- repeatable Education sections
- add-entry controls

---

## Multi-Step Navigation

The extension can reason about:

```text
Current step
Continue
Next
Back
Review
Submit
```

Navigation remains separate from field filling.

---

## Questions

Application questions are classified before being answered.

Sensitive or uncertain questions are intentionally left for manual review.

---

## Validation

The extension can detect:

- required missing fields
- visible validation errors
- invalid states
- failed autofill attempts

---

## Final Review

The final application step receives additional safety handling.

Submission requires:

```ts
explicitlyConfirmed === true
```

No confirmation means no automated submission action.

---

# Technology Stack

## Chrome Extension

- React
- TypeScript
- Vite
- Chrome Manifest V3
- Chrome Runtime API
- Chrome Storage API
- Chrome Tabs API
- Content Scripts
- Background Service Worker

---

## Backend

- Node.js
- Express
- TypeScript
- Zod
- Multer

---

## AI

- Google Gemini
- `@google/genai`
- structured JSON output
- low-temperature resume extraction strategy

Configured model:

```text
gemini-2.5-flash
```

---

## Database

- MongoDB Atlas
- Mongoose

---

## Resume Parsing

### PDF

```text
pdf-parse
```

Current backend dependency:

```text
pdf-parse ^2.4.5
```

The PDF parser is lazy-loaded in the PDF processing path to improve compatibility with the Vercel serverless runtime.

### DOCX

```text
mammoth
```

---

## Testing

- TypeScript compiler
- Vitest
- Playwright
- regression testing
- safety testing
- runtime API testing
- manual extension verification

---

## Deployment

Backend:

```text
Vercel
```

Database:

```text
MongoDB Atlas
```

Chrome extension:

```text
GitHub Release
+
Manifest V3 unpacked installation
```

Current release:

```text
v1.0.0
```

---

# High-Level Architecture

```text
                         ┌────────────────────┐
                         │       Resume       │
                         │    PDF / DOCX      │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │   Resume Parser    │
                         │ pdf-parse/Mammoth  │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │  Raw Resume Text   │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │      Gemini        │
                         │ Resume Understanding│
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │ Structured Candidate│
                         │       JSON         │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │ Zod + Normalizer   │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │   MongoDB Atlas    │
                         └─────────┬──────────┘
                                   │
                         Internal Candidate Ref
                                   │
                                   ▼
┌────────────────────────────────────────────────────────┐
│                   Chrome Extension                     │
│                                                        │
│ Candidate Profile → Background → Content Script       │
│                                → Workday DOM           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │    DOM Scanner    │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Semantic Mapper   │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │   Safe Autofill   │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │     Validator     │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │     Navigator     │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │   Final Review    │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ User Confirmation │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │      Submit       │
                 └───────────────────┘
```

---

# End-to-End Flow

## Step 1 — Resume Selection

The user opens the Chrome extension and selects:

```text
Choose Resume
```

Supported formats:

```text
PDF
DOCX
```

---

## Step 2 — Resume Upload

The extension sends the selected file to:

```http
POST /api/ai/resumes/parse
```

Multipart field:

```text
resume
```

---

## Step 3 — Text Extraction

PDF:

```text
PDF
 ↓
pdf-parse
 ↓
Extracted text
```

DOCX:

```text
DOCX
 ↓
Mammoth
 ↓
Extracted text
```

---

## Step 4 — AI Understanding

Raw text is sent to Gemini.

Example:

```text
SuperAGI
Software Development Engineer I
Nov 2025 - Apr 2026
...
```

Gemini converts it into structured information such as:

```json
{
  "company": "SuperAGI",
  "title": "Software Development Engineer I",
  "startDate": "2025-11",
  "endDate": "2026-04",
  "current": false
}
```

---

## Step 5 — Validation and Normalization

AI output is not blindly trusted.

```text
Gemini Output
     ↓
Schema Validation
     ↓
Candidate Normalizer
```

Invalid structures are rejected.

---

## Step 6 — Persistence

The validated candidate profile is stored in MongoDB.

The backend returns:

```text
candidateId
profile
```

to the extension.

---

## Step 7 — Automatic Extension Onboarding

The internal candidate ID is automatically stored in:

```text
chrome.storage.local
```

The user does not manually see or enter the database identifier.

Instead, the extension displays:

```text
✓ Resume ready
Candidate name
Current/recent title
Email
Skills
Resume filename
```

---

## Step 8 — Workday Detection

The user opens a supported Workday job application.

The extension determines whether the active tab is a supported Workday page.

---

## Step 9 — Workday Scanning

The content script scans the application DOM.

---

## Step 10 — Field Mapping

The scanner produces normalized field metadata.

The mapper connects:

```text
Workday Field
      ↕
Candidate Profile
```

---

## Step 11 — Safe Autofill

Only sufficiently confident mappings are automatically filled.

Valid existing values should not be unnecessarily overwritten.

---

## Step 12 — Dynamic Sections

Experience and Education repeatable sections can be detected and handled separately.

---

## Step 13 — Questions

Application questions are scanned and classified.

Unknown or sensitive questions remain for manual user input.

---

## Step 14 — Validation

The current Workday step is checked for:

```text
Missing required fields
Visible validation errors
Invalid states
```

---

## Step 15 — Navigation

The extension can identify navigation controls such as:

```text
Continue
Next
Back
Review
```

---

## Step 16 — Final Review

The application is scanned before the final submission action.

---

## Step 17 — Submission Safety

Submission is only permitted after explicit user confirmation.

---

# AI Strategy

AI is not used for everything.

The architecture follows:

```text
Deterministic rules
       ↓
Heuristics
       ↓
AI semantic reasoning
       ↓
Confidence
       ↓
User review when uncertain
```

This reduces:

- hallucinations
- unnecessary AI calls
- latency
- cost
- unsafe autofill
- incorrect sensitive answers

---

# Resume Parsing

Two parser paths are supported.

## PDF

PDF documents are processed using:

```text
pdf-parse
```

The PDF parser extracts textual resume content and normalizes whitespace before AI processing.

The PDF library is loaded only when a PDF needs to be processed.

This avoids unnecessarily loading PDF-specific runtime dependencies for DOCX requests.

---

## DOCX

DOCX files are processed using:

```text
mammoth
```

Windows and some HTTP clients may upload DOCX files with a MIME type such as:

```text
application/octet-stream
```

The parser therefore considers both:

```text
MIME type
+
safe filename extension
```

when identifying supported resume formats.

---

## Extraction Artifacts

Highly visual resumes may contain PDF/DOCX extraction artifacts.

Examples can include unusual characters originating from:

- icons
- custom fonts
- hyperlink symbols
- layout positioning

The AI parsing layer attempts to recover structured information from readable content without inventing missing information.

---

# Candidate Onboarding

Earlier development versions required manually entering a MongoDB Candidate ID.

That workflow has been removed from the public v1.0.0 extension.

Current onboarding is:

```text
Install extension
      ↓
Open popup
      ↓
Choose PDF/DOCX resume
      ↓
Process Resume
      ↓
Backend parses resume
      ↓
Gemini creates candidate profile
      ↓
MongoDB persists profile
      ↓
candidateId returned internally
      ↓
candidateId stored automatically
      ↓
Candidate Profile shown
```

The MongoDB ID remains an implementation detail.

---

# Candidate Profile

A structured candidate may contain:

```json
{
  "firstName": "Akshay",
  "middleName": "Ram",
  "lastName": "Chavan",
  "email": "candidate@example.com",
  "phone": "+91XXXXXXXXXX",
  "summary": "...",
  "skills": [],
  "experience": [],
  "education": [],
  "certifications": []
}
```

Depending on resume content, candidate information can also include:

- location
- LinkedIn
- GitHub
- portfolio
- experience-specific skills
- resume metadata

Gemini is instructed not to invent missing information.

If extracted content includes labels such as:

```text
LinkedIn
GitHub
Portfolio
```

but does not expose the actual URL, the model should not fabricate the missing URL.

---

# Chrome Extension Architecture

The extension follows Chrome Manifest V3.

Core components:

```text
React Popup
Background Service Worker
Content Script
Chrome Storage
Chrome Tabs
Runtime Messaging
```

---

## Popup

The React popup is the user-facing control panel.

Current user experience includes:

```text
Backend status
Workday detection

Candidate Profile
Resume upload / Replace Resume

Refresh status
Scan Workday page
Map fields to candidate
Autofill safe fields
Detect dynamic sections
Autofill Experience & Education
Detect navigation
Detect Questions
Validate Current Step
Scan Final Review

Privacy & Data Use
```

The old manual Candidate ID input is no longer part of the public onboarding flow.

---

## Background Service Worker

The background worker coordinates:

- backend communication
- active tab lookup
- candidate reference state
- field mapping
- scanning
- autofill
- navigation
- validation
- review
- submission confirmation

Manifest V3 workers can be suspended by Chrome.

Persistent state therefore uses:

```text
chrome.storage.local
```

rather than depending exclusively on in-memory JavaScript state.

---

## Content Script

The content script operates inside supported Workday pages.

Responsibilities include:

- DOM scanning
- field discovery
- filling controls
- detecting repeatable sections
- observing page mutations
- detecting navigation
- validating fields
- final review scanning
- guarded submission interaction

---

# Workday DOM Automation

The scanner attempts to understand fields using more than CSS selectors.

Metadata may include:

```text
HTML element
input type
name
id
placeholder
label
aria-label
aria-labelledby
surrounding text
required state
existing value
```

This makes the system more resilient than hardcoded selector-only automation.

---

# Semantic Field Mapping

Example:

```text
Workday:
Legal First Name

Candidate:
firstName = Akshay
```

Possible mapping:

```json
{
  "targetPath": "firstName",
  "confidence": 0.98,
  "shouldFill": true
}
```

Another example:

```text
Workday:
Professional Profile URL

Candidate:
LinkedIn?
GitHub?
Portfolio?
```

If the meaning cannot be determined confidently, the mapper should lower confidence rather than blindly choosing a value.

---

# Safe Autofill

Safety is a primary design goal.

The autofill engine considers:

```text
shouldFill
confidence
existing value
field type
candidate value
sensitive status
```

High-confidence fields may be filled.

Low-confidence fields remain for review.

The extension also attempts to avoid replacing useful existing form values.

---

# Dynamic and Repeatable Sections

Workday often supports multiple:

```text
Experience
Education
```

entries.

Example:

```text
Candidate experiences = 3
Existing Workday entries = 1
```

The extension can detect the section and reason about additional entries.

---

## MutationObserver

Dynamic Workday rendering is observed using browser mechanisms including:

```text
MutationObserver
```

This helps identify:

- newly rendered controls
- added repeatable sections
- asynchronous page changes
- dynamically inserted fields

---

# Multi-Step Navigation

Workday applications can contain states such as:

```text
My Information
Experience
Education
Questions
Voluntary Disclosures
Review
```

Navigation is intentionally separated from autofill.

The extension can detect controls such as:

```text
Continue
Next
Back
Review
```

before deciding what action is appropriate.

---

# Questions and EEO Handling

Questions are handled separately from ordinary contact fields.

Examples include:

```text
Do you require sponsorship?
Are you legally authorized to work?
Have you previously worked for this company?
```

The extension can classify questions where reliable candidate information exists.

However, sensitive or voluntary demographic information is not inferred.

Examples:

```text
Gender
Race
Ethnicity
Disability
Veteran status
Other EEO disclosures
```

Unknown sensitive fields should remain unanswered.

---

# Validation and Error Recovery

Before navigating forward, the extension can scan for validation problems.

Examples:

```text
Required field missing
Visible validation error
Unsupported value
Failed field update
```

The automation can stop instead of proceeding with an invalid form.

---

# Review and Submission Safety

Submission receives the strongest safety protection.

The extension must not bypass:

- authentication
- CAPTCHA
- MFA
- security challenges
- user review

The user manually handles authentication/security challenges.

Final workflow:

```text
Scan Final Review
        ↓
Review application
        ↓
Explicit confirmation
        ↓
Submission action
```

The submission handler requires:

```ts
explicitlyConfirmed === true
```

Without explicit confirmation, submission must not proceed.

---

# Repository Structure

```text
AI-powered-Chrome-extension/
│
├── apps/
│   │
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── prompts/
│   │   │   ├── routes/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   │
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── extension/
│       ├── public/
│       │   ├── icons/
│       │   └── manifest.json
│       │
│       ├── src/
│       │   ├── background/
│       │   ├── components/
│       │   ├── content/
│       │   ├── lib/
│       │   ├── types/
│       │   ├── App.tsx
│       │   ├── App.css
│       │   └── main.tsx
│       │
│       ├── dist/
│       ├── package.json
│       ├── tsconfig.app.json
│       └── vite.config.ts
│
├── docs/
│   ├── architecture.md
│   ├── ai-strategy.md
│   ├── testing.md
│   └── limitations.md
│
├── packages/
│
├── tests/
│
├── PRIVACY_POLICY.md
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

# Local Development Setup

## Prerequisites

Install:

```text
Node.js
npm
Git
Google Chrome
MongoDB Atlas account
Google Gemini API key
```

---

## Clone Repository

```bash
git clone https://github.com/akshaychavan23031998/AI-powered-Chrome-extension.git
```

Enter the project:

```bash
cd "AI-powered-Chrome-extension"
```

---

## Install Dependencies

```bash
npm install
```

The project uses npm workspaces.

---

# Environment Variables

Create:

```text
apps/api/.env
```

Example:

```env
NODE_ENV=development

PORT=4000

MONGODB_URI=your_mongodb_atlas_connection_string

GEMINI_API_KEY=your_gemini_api_key

GEMINI_MODEL=gemini-2.5-flash

CLIENT_ORIGIN=http://localhost:5173
```

Never commit:

```text
apps/api/.env
```

Use:

```text
apps/api/.env.example
```

as a configuration reference.

---

# Running the Backend

From the repository root:

```bash
npm run dev:api
```

Expected:

```text
MongoDB connected
API running at http://localhost:4000
```

---

## Local Health Check

```text
http://localhost:4000/api/health
```

Expected response:

```json
{
  "success": true,
  "service": "workday-ai-api",
  "status": "healthy",
  "database": "connected"
}
```

---

# Building the Chrome Extension

Run:

```bash
npm run build:extension
```

The production extension is generated in:

```text
apps/extension/dist
```

Important output files include:

```text
manifest.json
index.html
background.js
content.js
assets/
icons/
```

---

# Loading the Extension in Chrome

Open:

```text
chrome://extensions
```

Enable:

```text
Developer mode
```

Click:

```text
Load unpacked
```

For a source-code build, select:

```text
apps/extension/dist
```

Do not select:

```text
apps/extension/src
```

or the repository root.

---

## After Rebuilding

When you run:

```bash
npm run build:extension
```

Chrome does not automatically replace the running unpacked extension.

Return to:

```text
chrome://extensions
```

and click:

```text
Reload
```

on the extension card.

---

# Backend API

Production base URL:

```text
https://ai-powered-chrome-extension-api.vercel.app
```

---

## Health

```http
GET /api/health
```

---

## Raw Resume Extraction

```http
POST /api/resumes/extract
```

Multipart field:

```text
resume
```

Supports:

```text
PDF
DOCX
```

---

## AI Resume Parsing + Candidate Creation

```http
POST /api/ai/resumes/parse
```

Multipart field:

```text
resume
```

Flow:

```text
Upload
 ↓
Extract
 ↓
Gemini
 ↓
Validate
 ↓
Normalize
 ↓
Persist
 ↓
Return candidateId + profile
```

---

## Create Candidate

```http
POST /api/candidates
```

---

## Get Candidate

```http
GET /api/candidates/:candidateId
```

---

## AI Field Mapping

The backend also exposes AI field-mapping functionality under:

```text
/api/ai/fields
```

The extension uses deterministic heuristics first and AI when semantic interpretation is necessary.

---

# Production Deployment

## Backend

The backend is deployed on Vercel.

Production:

[https://ai-powered-chrome-extension-api.vercel.app](https://ai-powered-chrome-extension-api.vercel.app)

---

## Database

MongoDB Atlas stores structured candidate profiles.

---

## Vercel Environment Variables

Production secrets are configured through Vercel environment variables.

Examples:

```text
NODE_ENV
MONGODB_URI
GEMINI_API_KEY
GEMINI_MODEL
CLIENT_ORIGIN
```

Secrets must never be committed to Git.

---

## Express + Vercel

The Express application is exported from:

```text
apps/api/src/app.ts
```

for Vercel's serverless execution path.

Local execution uses:

```text
apps/api/src/server.ts
```

---

## MongoDB in Serverless Runtime

Vercel serverless execution does not behave exactly like the long-running local development server.

MongoDB connectivity is therefore established appropriately for the production request path.

Connection reuse helps avoid unnecessary duplicate database connections.

---

## PDF Parsing in Vercel

The PDF parser is loaded dynamically only when a PDF request is processed.

Current implementation:

```text
PDF request
    ↓
lazy import pdf-parse worker
    ↓
lazy import PDFParse
    ↓
extract text
    ↓
destroy parser
```

This prevents PDF-specific runtime dependencies from being loaded unnecessarily for DOCX and unrelated API requests.

---

# Testing

The project uses multiple testing and validation layers.

---

## Backend Build

```bash
npm run build:api
```

---

## Backend Typecheck

```bash
npm --workspace apps/api run typecheck
```

---

## Extension Build

```bash
npm run build:extension
```

---

## Git Whitespace Validation

```bash
git diff --check
```

---

## Resume Parsing Tests

Real PDF and DOCX resumes have been tested.

Validated flow:

```text
File upload
   ↓
Text extraction
   ↓
Gemini
   ↓
Candidate profile
   ↓
MongoDB
```

---

## Local PDF Test

Example:

```bash
curl.exe -X POST \
  -F "resume=@resume.pdf" \
  http://localhost:4000/api/ai/resumes/parse
```

---

## Local DOCX Test

Example:

```bash
curl.exe -X POST \
  -F "resume=@resume.docx" \
  http://localhost:4000/api/ai/resumes/parse
```

---

## Production Backend Verification

Validated production behavior includes:

```text
Backend connected
MongoDB connected
Resume processing available through extension
Candidate profile returned
```

---

## Candidate Onboarding Test

Verified extension workflow:

```text
Choose Resume
      ↓
Process Resume
      ↓
✓ Resume ready
      ↓
Candidate Profile displayed
```

Candidate information can include:

```text
Name
Title
Email
Skills
Resume filename
```

---

## Extension Build Verification

Production output includes:

```text
manifest.json
background.js
content.js
index.html
assets/
icons/
```

---

## Safety Expectations

Regression and manual safety checks cover:

- do not bypass login
- do not bypass CAPTCHA
- do not bypass MFA
- do not infer sensitive EEO values
- do not aggressively overwrite valid fields
- do not submit without explicit confirmation

---

# Security and Privacy

## Gemini API Key

The Gemini API key exists only in backend environment variables.

It must never be embedded in:

```text
Chrome extension
Frontend bundle
Git repository
```

---

## MongoDB Credentials

MongoDB credentials are provided through:

```text
MONGODB_URI
```

and stored only in server-side environment configuration.

---

## Chrome Storage

The extension uses:

```text
chrome.storage.local
```

for extension state and internal candidate references.

Backend secrets are not stored in Chrome storage.

---

## Resume Data

Resume information may be processed by the backend to:

- extract candidate information
- generate a structured profile
- support Workday field mapping
- support autofill

See:

[PRIVACY_POLICY.md](./PRIVACY_POLICY.md)

for the project's privacy disclosure.

---

## Workday Data

Workday form information may be processed when needed for:

- field understanding
- semantic mapping
- validation
- resume-aware autofill

---

## Sensitive Information

Unknown sensitive information is not automatically inferred.

---

## Authentication

The extension does not bypass:

```text
Workday sign-in
Account creation
CAPTCHA
MFA
Security challenges
```

These remain under user control.

---

## Public API Considerations

The current GitHub/demo deployment is intended for:

```text
Assessment
Demonstration
Portfolio
Development
```

A broader public production rollout would benefit from additional hardening such as:

- user authentication
- per-user candidate ownership
- rate limiting
- API abuse protection
- stricter data-retention policies
- tighter database network restrictions
- candidate deletion controls

---

# Phase-by-Phase Development History

This project was developed incrementally.

---

## Phase 1 — Project Foundation

Created:

- npm workspaces
- React/Vite extension
- Node/Express API skeleton
- shared packages
- documentation structure
- testing directories
- root scripts
- `.gitignore`

Commit:

[`b9e7df9` — phase 1: initialize project foundation](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/b9e7df9ed3412ec928324b69c3b1d35b4d62c745)

---

## Phase 2 — Backend Foundation

Added:

- Express application
- TypeScript configuration
- environment validation
- MongoDB connectivity
- health endpoint
- error handling
- startup/shutdown flow

Commit:

[`a3b0b75` — phase 2: build backend foundation](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/a3b0b7535584d8c3f2c5f5a382ca3cbba206f6ea)

---

## Phase 3 — Resume Parsing and Candidate Profiles

Implemented:

- PDF parsing
- DOCX parsing
- upload validation
- candidate types
- Zod validation
- Mongoose candidate model
- persistence
- retrieval
- invalid ID handling

Commit:

[`43b3c6f` — phase 3: add resume parsing and candidate profiles](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/43b3c6feaa4e657f358f74d9cc17e1a65a8da677)

---

## Phase 4 — Gemini Resume Understanding

Implemented:

- Gemini client
- resume parsing prompt
- structured AI output
- candidate normalization
- schema validation
- AI resume endpoint
- candidate persistence

Commit:

[`d02e9c8` — phase 4: add Gemini resume understanding](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/d02e9c8f7b2106db1bbb56a05abbd9d39180355a)

---

## Phase 5 — Chrome Extension Foundation

Implemented:

- Manifest V3
- popup
- service worker
- content script
- Chrome storage
- runtime messaging
- backend status
- Workday permissions
- Workday detection

Commit:

[`d57156b` — phase 5: build Chrome extension foundation](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/d57156b5a12ab028d89820504ee88d96d8c140ca)

---

## Phase 6 — Workday DOM Scanner

Implemented normalized Workday form scanning.

Commit:

[`94e6f8a` — phase 6: add Workday DOM scanner](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/94e6f8a3e65c89fe2baa4684f35f5bc30ef2bd27)

---

## Phase 7 — Semantic Field Mapping

Implemented semantic mapping between Workday fields and candidate information.

Commit:

[`c0b9e0c` — phase 7: add semantic field mapping](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/c0b9e0c1bd88a5bb8b638d42e89d27fd4d1d2fd3)

---

## Phase 8 — Safe Workday Autofill

Implemented:

- confidence-aware filling
- safe value selection
- prefilled-value protection
- DOM event dispatch
- high-confidence-only automation

Commit:

[`c2ba11b` — phase 8: add safe Workday autofill engine](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/c2ba11b60949159b08cc93094cec15c87785e287)

---

## Phase 9 — Dynamic and Repeatable Workday Sections

Added support for:

- dynamic Workday rendering
- repeatable Experience structures
- repeatable Education structures

Commit:

[`4fe0d1d` — phase 9: add dynamic repeatable Workday sections](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/4fe0d1d78362189c0d60f28a9930efaf19838f19)

---

## Phase 10 — Multi-Step Workday Navigator

Added:

- page-state detection
- navigation controls
- multi-step workflow awareness

Commit:

[`e11896c` — phase 10: add multi-step Workday navigator](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/e11896cdfb6f10b22c433b0d179392dade3ca087)

---

## Phase 11 — Workday Question Detection

Added application-question detection and conservative sensitive-data handling.

Commit:

[`6149f67` — phase 11: add Workday question detection and classification](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/6149f6705dcb2a0080d72e09bcbf3bbe6e4316eb)

---

## Phase 12 — Validation and Error Recovery

Added:

- validation scanning
- error awareness
- safer navigation behavior

Commit:

[`703b1c8` — phase 12: add Workday validation and error recovery](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/703b1c8b775cb890c4d511416a0b473e50840c28)

---

## Phase 13 — Final Review and Explicit Submission

Added:

- final review scanning
- explicit submission confirmation
- submission guard

Commit:

[`0138339` — phase 13: add final review and explicit submission](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/013833976b906f4d2e70e50206bedb5819e276be)

---

## Phase 14 — Testing and Safety Hardening

Added regression and safety coverage.

Commit:

[`a201c62` — phase 14: add Workday safety and regression tests](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/a201c62a9be47ec4d22c852e62fbe1dfd9d5cb09)

---

## Phase 15 — Documentation and Release Preparation

Added:

- complete documentation
- architecture documentation
- AI strategy
- testing documentation
- limitations
- privacy/release preparation

---

# Deployment Fixes

## Express Vercel Export

Added the Express-compatible Vercel export.

Commit:

[`9c7d9e1` — fix: export Express app for Vercel](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/9c7d9e19f1cb82fe711be97405314c1b4446dc45)

---

## MongoDB Connection in Vercel Runtime

Added MongoDB connectivity for serverless execution.

Commit:

[`ad3e601` — fix: connect MongoDB in Vercel runtime](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/ad3e6013ca04668c3712a0cbcac10aa4515fbb7b)

---

# Public Onboarding and v1.0.0 Hardening

After the initial documentation phase, the extension onboarding flow was improved for public/demo usage.

---

## Resume Onboarding

The manual Candidate ID workflow was replaced by:

```text
Choose Resume
→ Process Resume
→ Candidate profile created
→ Candidate reference stored automatically
→ Resume Ready UI
```

Commit:

[`7ae018c` — feat: add resume onboarding and fix PDF parsing](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/7ae018c8aff90604408344f1e3dd2707f4b0ed42)

---

## Vercel PDF Runtime Compatibility

The PDF parser was changed to lazy loading for serverless compatibility.

Commit:

[`e28f8ca` — fix: lazy load PDF parser for Vercel runtime](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/e28f8cab069beab0e379a4498e9c2cccb59c01fa)

---

# GitHub Release v1.0.0

The first packaged release is:

```text
Workday AI Application Assistant v1.0.0
```

Release:

[https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/releases/tag/v1.0.0](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/releases/tag/v1.0.0)

Asset:

```text
workday-ai-assistant-v1.0.0.zip
```

The release is distributed through GitHub for:

- assessment
- demonstration
- development
- portfolio use

---

# Known Limitations

## Workday DOM Changes

Workday can change its DOM implementation.

The scanner and automation logic may require maintenance as Workday evolves.

---

## Company-Specific Workday Configuration

Employers may configure Workday differently.

Full compatibility cannot be guaranteed across every Workday tenant without testing.

---

## Resume Formatting

Highly visual resumes may create extraction artifacts.

Examples include:

```text
unexpected icon characters
broken line ordering
decorative symbol extraction
```

AI normalization can recover some obvious issues, but extraction quality still matters.

---

## Hidden Hyperlinks

Resume extraction may return:

```text
LinkedIn
GitHub
Portfolio
```

without exposing the underlying hyperlinks.

Missing URLs are intentionally not invented.

---

## PDF Text Extraction

Image-only or scanned PDFs may not contain directly extractable text.

OCR is not currently part of the v1.0.0 parsing pipeline.

---

## CAPTCHA and MFA

The extension does not automate or bypass:

```text
CAPTCHA
MFA
Authentication challenges
```

---

## Sensitive Questions

Unknown sensitive demographic information is not inferred.

Manual user input is required.

---

## Candidate Replacement

In v1.0.0, replacing a resume creates a new candidate profile and switches the local candidate reference.

Automatic cleanup/deletion of superseded database candidate records is not yet implemented.

---

## Public API Security

The current backend is appropriate for assessment/demo use.

A broad public product rollout would require stronger:

- authentication
- authorization
- candidate ownership controls
- rate limiting
- abuse protection
- retention policies

---

## Final Submission

Submission intentionally requires explicit confirmation.

This is a safety requirement.

---

# Future Improvements

Potential improvements include:

- stronger Shadow DOM traversal
- configurable confidence thresholds
- candidate profile editing
- multiple saved candidate profiles
- candidate profile deletion
- automatic cleanup of replaced profiles
- encrypted local cache
- user authentication
- per-user candidate ownership
- rate limiting
- API abuse protection
- application history
- application status tracking
- richer question-answer assistance
- per-company Workday adapters
- better date normalization
- better phone normalization
- stronger hyperlink extraction
- scanned-PDF/OCR support
- telemetry with explicit opt-in
- Chrome Web Store publication
- additional E2E Workday tenant coverage

---

# Demo Flow

Recommended recording sequence:

## 1. Project Introduction

Explain:

```text
Problem
Architecture
Technology stack
Safety philosophy
```

---

## 2. GitHub Release

Show:

```text
v1.0.0
workday-ai-assistant-v1.0.0.zip
```

---

## 3. Install Extension

Show:

```text
Download ZIP
Extract
chrome://extensions
Developer mode
Load unpacked
```

---

## 4. Show Backend

Open:

[Production Health Endpoint](https://ai-powered-chrome-extension-api.vercel.app/api/health)

Show:

```text
success: true
database: connected
```

---

## 5. Resume Onboarding

Open the extension.

Show:

```text
Choose Resume
→ PDF
→ Process Resume
```

---

## 6. Candidate Profile

Show:

```text
✓ Resume ready
Candidate name
Job title
Email
Skills
Resume filename
```

Explain that the candidate ID is handled internally.

---

## 7. Reopen Popup

Close and reopen the extension popup.

Demonstrate candidate-profile persistence.

---

## 8. Open Workday

Open the selected supported Workday application.

Show:

```text
Workday page → Detected
```

---

## 9. Scan Page

Click:

```text
Scan Workday page
```

Explain DOM scanning.

---

## 10. Map Fields

Click:

```text
Map fields to candidate
```

Explain:

```text
heuristics
semantic mapping
confidence
AI fallback
```

---

## 11. Safe Autofill

Click:

```text
Autofill safe fields
```

Explain why only high-confidence values are filled.

---

## 12. Experience and Education

Demonstrate:

```text
Detect dynamic sections
Autofill Experience & Education
```

---

## 13. Questions

Demonstrate:

```text
Detect Questions
```

Explain sensitive/manual handling.

---

## 14. Validation

Run:

```text
Validate Current Step
```

Show validation and error recovery.

---

## 15. Navigation

Demonstrate multi-step navigation detection.

---

## 16. Final Review

Run:

```text
Scan Final Review
```

---

## 17. Submission Safety

Explain clearly:

```text
No silent submission.
Explicit user confirmation is mandatory.
Authentication/CAPTCHA/MFA are never bypassed.
```

---

# Final Submission Checklist

## Repository and Release

- [x] GitHub repository public
- [x] Production backend deployed
- [x] GitHub Release v1.0.0 created
- [x] Extension ZIP attached to release
- [x] Privacy policy included
- [x] PDF/DOCX onboarding implemented
- [x] Manual Candidate ID onboarding removed
- [x] Production extension build created

---

## Build Verification

- [x] backend build succeeds
- [x] backend TypeScript typecheck succeeds
- [x] extension build succeeds
- [x] `git diff --check` passes
- [x] unpacked extension loads successfully
- [x] content script exists in production build

---

## Resume Flow

- [x] PDF upload works locally
- [x] DOCX upload works locally
- [x] Gemini structured parsing works
- [x] MongoDB candidate creation works
- [x] extension candidate profile onboarding works
- [x] candidate profile displays without manual ID entry

---

## Safety

- [x] Gemini key kept backend-only
- [x] MongoDB credentials kept backend-only
- [x] CAPTCHA bypass is not implemented
- [x] MFA bypass is not implemented
- [x] sensitive demographic inference is prohibited
- [x] explicit submission confirmation implemented

---

## Final Demo / Assessment

- [ ] primary Workday target documented
- [ ] Workday target walkthrough recorded
- [ ] full demo video recorded
- [ ] demo video link added to README
- [ ] final end-to-end Workday verification completed

---

# Important Development Commands

## Install

```bash
npm install
```

---

## Backend Development

```bash
npm run dev:api
```

---

## Backend Build

```bash
npm run build:api
```

---

## Backend Typecheck

```bash
npm --workspace apps/api run typecheck
```

---

## Extension Development

```bash
npm run dev:extension
```

> The Vite development page is not the actual Chrome extension environment.

Chrome APIs such as:

```ts
chrome.runtime
```

work when the built application is loaded as an extension.

---

## Extension Build

```bash
npm run build:extension
```

---

## Git Verification

```bash
git diff --check
git status
```

---

# Git Repository

```text
https://github.com/akshaychavan23031998/AI-powered-Chrome-extension
```

---

# Production API

Backend:

[https://ai-powered-chrome-extension-api.vercel.app](https://ai-powered-chrome-extension-api.vercel.app)

Health:

[https://ai-powered-chrome-extension-api.vercel.app/api/health](https://ai-powered-chrome-extension-api.vercel.app/api/health)

---

# Engineering Principles

## Safety Over Aggressive Automation

An uncertain field should remain empty rather than receive incorrect candidate information.

---

## Deterministic Before AI

AI is useful for semantic interpretation, but simple deterministic mappings should not require unnecessary AI calls.

---

## Validate AI Output

AI-generated structures are validated by deterministic application logic before use.

---

## Do Not Infer Sensitive Information

Unknown sensitive candidate information remains unknown.

---

## Preserve Valid Existing Values

The extension should avoid overwriting useful values that are already present.

---

## Backend Secrets Stay Backend-Only

Gemini and database credentials must never be bundled inside the extension.

---

## Separate Responsibilities

The architecture separates:

```text
Resume Parser
AI Understanding
Candidate Persistence
DOM Scanner
Semantic Mapper
Autofill Engine
Repeatable Section Handler
Question Classifier
Navigator
Validator
Final Review
Submission Guard
```

---

## User Remains in Control

The extension assists the candidate.

It does not take irreversible actions silently.

---

# Author

## Akshay Ram Chavan

Full Stack Software Engineer focused on:

- React.js
- Next.js
- TypeScript
- JavaScript
- Node.js
- Express.js
- MongoDB
- PostgreSQL
- REST APIs
- System Design
- Docker
- Kubernetes
- AI-powered applications
- scalable full-stack architecture

### GitHub

[Akshay Chavan](https://github.com/akshaychavan23031998)

### Portfolio

[https://akshay-chavan-portfolio.vercel.app/](https://akshay-chavan-portfolio.vercel.app/)

---

# Final Note

This project was built incrementally from a blank monorepo into an AI-assisted Workday application automation system.

The engineering journey:

```text
Project Foundation
       ↓
Backend Foundation
       ↓
Resume Parsing
       ↓
Gemini Resume Understanding
       ↓
Chrome Extension Foundation
       ↓
Workday DOM Scanner
       ↓
Semantic Field Mapping
       ↓
Safe Autofill
       ↓
Dynamic Sections
       ↓
Multi-Step Navigation
       ↓
Question Classification
       ↓
Validation & Error Recovery
       ↓
Final Review
       ↓
Explicit Submission Guard
       ↓
Testing & Safety Hardening
       ↓
Production Deployment
       ↓
Public Resume Onboarding
       ↓
PDF Serverless Compatibility
       ↓
Privacy + Packaging
       ↓
GitHub Release v1.0.0
```

The most important architectural principle remains:

> **Understand first. Map carefully. Automate safely. Keep the user in control.**