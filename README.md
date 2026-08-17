# Workday AI Application Assistant

AI-powered Chrome extension for understanding a candidate's resume and safely assisting with Workday job applications.

The system combines:

- Chrome Extension — Manifest V3
- React + TypeScript
- Node.js + Express
- MongoDB Atlas
- Google Gemini
- Resume parsing for PDF and DOCX
- Semantic field mapping
- Workday DOM automation
- Dynamic/repeatable section handling
- Multi-step navigation
- Validation and error recovery
- Final review and explicit user confirmation before submission

---

# Live Links

## Backend API

**Production API**

[https://ai-powered-chrome-extension-api.vercel.app](https://ai-powered-chrome-extension-api.vercel.app)

**Health Check**

[https://ai-powered-chrome-extension-api.vercel.app/api/health](https://ai-powered-chrome-extension-api.vercel.app/api/health)

A healthy deployment should return something similar to:

```json
{
  "success": true,
  "service": "workday-ai-api",
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-08-16T18:24:32.497Z"
}
```

---

## GitHub Repository

[AI-powered Chrome Extension](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension)

---

## Portfolio

To explore more of my projects, engineering work, technical skills, and experience:

[Akshay Chavan — Portfolio](https://akshay-chavan-portfolio.vercel.app/)

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
10. [Candidate Profile](#candidate-profile)
11. [Chrome Extension Architecture](#chrome-extension-architecture)
12. [Workday DOM Automation](#workday-dom-automation)
13. [Semantic Field Mapping](#semantic-field-mapping)
14. [Safe Autofill](#safe-autofill)
15. [Dynamic and Repeatable Sections](#dynamic-and-repeatable-sections)
16. [Multi-Step Navigation](#multi-step-navigation)
17. [Questions and EEO Handling](#questions-and-eeo-handling)
18. [Validation and Error Recovery](#validation-and-error-recovery)
19. [Review and Submission Safety](#review-and-submission-safety)
20. [Repository Structure](#repository-structure)
21. [Local Development Setup](#local-development-setup)
22. [Environment Variables](#environment-variables)
23. [Running the Backend](#running-the-backend)
24. [Building the Chrome Extension](#building-the-chrome-extension)
25. [Loading the Extension in Chrome](#loading-the-extension-in-chrome)
26. [Backend API](#backend-api)
27. [Production Deployment](#production-deployment)
28. [Testing](#testing)
29. [Security](#security)
30. [Phase-by-Phase Development History](#phase-by-phase-development-history)
31. [Known Limitations](#known-limitations)
32. [Future Improvements](#future-improvements)
33. [Demo Flow](#demo-flow)
34. [Final Submission Checklist](#final-submission-checklist)
35. [Author](#author)

---

# Project Overview

The **Workday AI Application Assistant** is an AI-powered Chrome extension designed to reduce the repetitive work involved in completing Workday job applications.

Instead of blindly filling fields, the system first understands the candidate.

It:

1. accepts a PDF or DOCX resume,
2. extracts the resume text,
3. sends the text to Google Gemini,
4. converts the resume into structured candidate JSON,
5. validates that JSON using Zod,
6. stores the profile in MongoDB,
7. scans a Workday application page,
8. understands the semantic meaning of fields,
9. maps candidate information to those fields,
10. fills only sufficiently confident fields,
11. validates the page,
12. handles dynamic sections and multi-step workflows,
13. pauses for uncertain or sensitive questions,
14. shows a final review,
15. requires explicit user confirmation before submission.

The system follows a core principle:

> **Heuristics first, AI second, user review when uncertain.**

The goal is not uncontrolled browser automation.

The goal is **safe, explainable, resume-aware job application assistance**.

---

# Problem Statement

Job applicants regularly enter the same information across Workday applications:

- name
- email
- phone number
- address
- LinkedIn
- GitHub
- work experience
- education
- skills
- certifications
- employment dates
- application questions

Several problems make this harder than ordinary form autofill:

### 1. Different field wording

The same information may appear as:

```text
First Name
Given Name
Legal First Name
Preferred First Name
```

A simple selector-based autofill system cannot understand these differences reliably.

---

### 2. Dynamic forms

Workday frequently renders content asynchronously.

Fields may appear after:

- page transitions,
- button clicks,
- modal interactions,
- section expansion,
- repeatable item creation.

---

### 3. Multi-step workflows

Applications often contain steps such as:

```text
My Information
Experience
Education
Application Questions
Voluntary Disclosures
Review
```

Automation therefore requires state awareness.

---

### 4. Repeatable sections

Experience and education are not single fields.

They are collections:

```text
Experience 1
Experience 2
Experience 3
...
```

The automation needs to detect existing entries and safely create additional entries.

---

### 5. Sensitive questions

Some application questions should not be inferred.

Examples:

- disability
- veteran status
- gender
- race/ethnicity
- sponsorship
- legal declarations
- voluntary disclosures

These require a conservative strategy.

---

### 6. Final submission is irreversible

The extension must never automatically submit an application without the candidate knowing exactly what is happening.

Therefore this project requires:

```text
Final Review
      ↓
Explicit User Confirmation
      ↓
Submit
```

---

# Solution

The system is divided into two major applications.

```text
┌───────────────────────────────────────┐
│          Chrome Extension             │
│                                       │
│ React Popup                           │
│ Background Service Worker             │
│ Content Script                        │
│ Workday Scanner                       │
│ Field Mapper                          │
│ Autofill Engine                       │
│ Navigator                             │
│ Validation Engine                     │
│ Review + Submission Guard             │
└──────────────────┬────────────────────┘
                   │
                   │ HTTPS
                   ▼
┌───────────────────────────────────────┐
│              Backend API              │
│                                       │
│ Node.js                               │
│ Express                               │
│ TypeScript                            │
│ Resume Parser                         │
│ Gemini Integration                    │
│ Candidate Services                    │
│ Field Mapping API                     │
└──────────────────┬────────────────────┘
                   │
           ┌───────┴────────┐
           │                │
           ▼                ▼
     MongoDB Atlas      Google Gemini
```

---

# Core Features

## Resume Processing

- PDF support
- DOCX support
- file validation
- file-size protection
- raw text extraction
- whitespace normalization

---

## AI Resume Understanding

Gemini converts unstructured resume text into structured candidate data.

Extracted information includes:

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

Structured profiles are validated and persisted using:

```text
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

## Workday Detection

The extension identifies supported Workday pages.

Supported host patterns include:

```text
*.myworkdayjobs.com
*.workday.com
```

---

## DOM Scanner

The extension scans supported controls including:

- input
- textarea
- select
- radio
- checkbox
- date-like controls
- buttons
- labels
- ARIA metadata
- repeatable sections

---

## Semantic Mapping

The mapper considers:

```text
Field label
Field type
Field description
Placeholder
ARIA labels
Candidate profile
```

The system first attempts deterministic mapping.

AI is used when semantic interpretation is required.

---

## Safe Autofill

Autofill only happens when confidence is sufficiently high.

The system avoids overwriting valid existing values.

---

## Dynamic Workday Support

Includes support for:

- delayed rendering
- MutationObserver
- repeatable Experience sections
- repeatable Education sections
- add-entry controls

---

## Navigation

The system can detect and reason about:

- current step
- Continue
- Next
- Back
- Review
- Submit

---

## Questions

Application questions are classified before answering.

Sensitive or uncertain questions are intentionally left for manual review.

---

## Validation

Before continuing, the extension can detect:

- required missing fields
- visible validation errors
- invalid states
- failed autofill attempts

---

## Final Review

The final application step is treated separately.

The extension must not silently submit an application.

Submission requires:

```text
explicitlyConfirmed === true
```

---

# Technology Stack

## Chrome Extension

- React
- TypeScript
- Vite
- Manifest V3
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
- low-temperature deterministic extraction

Current configured model:

```text
gemini-2.5-flash
```

---

## Database

- MongoDB Atlas
- Mongoose ODM

---

## Resume Parsing

### PDF

```text
pdfjs-dist
```

### DOCX

```text
mammoth
```

---

## Testing

- TypeScript compiler
- Vitest
- Playwright
- safety/regression tests
- runtime API tests
- manual Workday verification

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
Manifest V3 unpacked build
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
                         │ PDF.js / Mammoth   │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │   Raw Resume Text  │
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
                         │        JSON        │
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
                                   │ Candidate ID
                                   ▼
┌────────────────────────────────────────────────────────┐
│                  Chrome Extension                      │
│                                                        │
│ Popup → Background → Content Script → Workday DOM     │
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
                 │  Safe Autofill    │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │    Validator      │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │    Navigator      │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │  Final Review     │
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

## Step 1 — Resume upload

Candidate uploads:

```text
resume.pdf
```

or:

```text
resume.docx
```

---

## Step 2 — Text extraction

```text
PDF
 ↓
pdfjs-dist
```

or:

```text
DOCX
 ↓
Mammoth
```

---

## Step 3 — AI understanding

Raw text is sent to Gemini.

Example input:

```text
SuperAGI
Software Development Engineer I
Nov 2025 - Apr 2026
...
```

Gemini converts this into structured JSON.

Example:

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

## Step 4 — Validation

Gemini output is never trusted blindly.

```text
Gemini Output
     ↓
Zod Validation
     ↓
Candidate Normalizer
```

Malformed data is rejected.

---

## Step 5 — Persistence

Validated candidate data is stored in MongoDB.

A candidate receives a unique MongoDB ID.

Example:

```text
6a80b0cf3963d566352325e8
```

---

## Step 6 — Extension loads candidate

The candidate ID is entered/saved through the extension popup.

---

## Step 7 — Workday scanning

Content scripts scan the current Workday page.

---

## Step 8 — Field mapping

The scanner produces normalized field metadata.

The mapper connects:

```text
Workday Field
      ↕
Candidate Profile
```

---

## Step 9 — Safe autofill

Only high-confidence mappings are automatically filled.

---

## Step 10 — Validation

The page is checked before navigation.

---

## Step 11 — Navigation

The extension continues through Workday steps.

---

## Step 12 — Final review

The candidate reviews the application.

---

## Step 13 — Submission

Submission only occurs after explicit confirmation.

---

# AI Strategy

AI is not used for everything.

The architecture deliberately follows:

```text
Deterministic rules
       ↓
Heuristics
       ↓
AI semantic reasoning
       ↓
Confidence score
       ↓
User review when uncertain
```

This reduces:

- hallucinations
- unnecessary AI calls
- latency
- cost
- unsafe autofill

---

# Resume Parsing

Two parser paths exist.

## PDF

PDF documents are processed with PDF.js.

The parser extracts text from each page and combines it.

---

## DOCX

DOCX files are processed using Mammoth.

Because Windows uploads may report DOCX files as:

```text
application/octet-stream
```

the upload system also considers safe filename extension validation.

---

# Candidate Profile

A structured candidate contains information such as:

```json
{
  "firstName": "Akshay",
  "middleName": "Ram",
  "lastName": "Chavan",
  "email": "candidate@example.com",
  "phone": "+91XXXXXXXXXX",
  "location": {
    "city": "Bengaluru",
    "country": "India"
  },
  "links": {
    "linkedin": "",
    "github": "",
    "portfolio": ""
  },
  "summary": "...",
  "skills": [],
  "experience": [],
  "education": [],
  "certifications": []
}
```

Gemini is instructed not to invent missing information.

For example, if raw resume extraction contains:

```text
LinkedIn
GitHub
Portfolio
```

but does not expose the actual URLs, the model should not invent those URLs.

---

# Chrome Extension Architecture

The extension follows Manifest V3.

Important components:

```text
Popup
Background Service Worker
Content Script
Chrome Storage
Runtime Messaging
```

---

## Popup

The React popup acts as the control panel.

It exposes actions such as:

```text
Backend status
Workday detection
Candidate ID
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
```

---

## Background Service Worker

The background worker coordinates:

- backend requests
- active-tab lookup
- candidate state
- field mapping
- scanning
- autofill
- navigation
- review
- submission confirmation

Because Manifest V3 service workers may be suspended, persistent state is stored in:

```text
chrome.storage.local
```

rather than relying only on global JavaScript memory.

---

## Content Script

The content script runs inside matching Workday pages.

Responsibilities include:

- DOM scanning
- identifying fields
- filling controls
- detecting dynamic sections
- observing page changes
- detecting navigation
- validating fields
- final review scanning
- controlled submission

---

# Workday DOM Automation

The scanner attempts to understand a field using more than just selectors.

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

This makes the system more robust than a hardcoded CSS-selector-only approach.

---

# Semantic Field Mapping

Example:

```text
Workday:
"Legal First Name"

Candidate:
firstName = "Akshay"
```

Mapped result:

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
"Professional Profile URL"

Candidate:
?
```

If the system cannot determine whether this means LinkedIn, portfolio, GitHub, or another profile confidently, it should lower confidence instead of blindly filling a value.

---

# Safe Autofill

Safety is a core design requirement.

The system considers:

```text
shouldFill
confidence
existing value
field type
candidate value
```

High-confidence fields may be filled.

Low-confidence fields should remain for review.

The extension also attempts to avoid overwriting useful prefilled values.

---

# Dynamic and Repeatable Sections

Workday often allows multiple:

```text
Experience
Education
```

entries.

The system includes repeatable-section support.

Example:

```text
Candidate experiences = 3
Current Workday experience entries = 1
```

The extension can reason about adding the missing entries.

---

## MutationObserver

Dynamic Workday rendering is handled using browser observation mechanisms such as:

```text
MutationObserver
```

This helps detect:

- newly rendered fields
- added repeatable items
- asynchronous page changes

---

# Multi-Step Navigation

The navigator understands that Workday applications are not single-page forms.

Possible states include:

```text
My Information
Experience
Education
Questions
Voluntary Disclosures
Review
```

Navigation actions are separate from autofill.

The extension can detect:

```text
Continue
Next
Back
Review
```

before deciding what action is appropriate.

---

# Questions and EEO Handling

Questions are treated differently from ordinary contact fields.

Examples:

```text
Do you require sponsorship?
Are you legally authorized to work?
Have you worked here before?
```

The system may classify deterministic questions when reliable information exists.

However, sensitive voluntary information is not inferred.

Examples:

```text
Gender
Race
Ethnicity
Disability
Veteran status
Other EEO disclosures
```

Unknown sensitive information should remain unanswered.

---

# Validation and Error Recovery

Before navigating to the next Workday step, the extension can scan for validation issues.

Examples:

```text
Required field missing
Visible validation error
Unsupported value
Failed field update
```

The automation can then stop instead of continuing with a broken form.

---

# Review and Submission Safety

Submission receives the strongest safety protection.

The extension must never bypass:

- authentication
- CAPTCHA
- MFA
- user review

The candidate manually handles authentication/security challenges.

Before submission:

```text
Scan Final Review
        ↓
Review fields
        ↓
Explicit confirmation
        ↓
Submit
```

The submission handler requires:

```ts
explicitlyConfirmed === true
```

Without that condition, submission must be rejected.

---

# Repository Structure

```text
AI-powered Chrome extension/
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
│   ├── shared-types/
│   └── shared-schemas/
│
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   └── integration/
│
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

Development environment used during this project:

```text
Node.js v22.20.0
npm 10.9.3
Git 2.51.0.windows.2
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

From the repository root:

```bash
npm install
```

The repository uses npm workspaces.

---

# Environment Variables

Create:

```text
apps/api/.env
```

Use:

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

as a reference only.

---

# Running the Backend

From repository root:

```bash
npm run dev:api
```

Expected:

```text
MongoDB connected
API running at http://localhost:4000
```

---

## Local health check

Open:

```text
http://localhost:4000/api/health
```

Expected:

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

Production build is generated in:

```text
apps/extension/dist
```

Important files include:

```text
manifest.json
index.html
background.js
content.js
assets/
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

Select:

```text
apps/extension/dist
```

Do not select:

```text
apps/extension/src
```

or the repository root.

---

## After rebuilding

When running:

```bash
npm run build:extension
```

Chrome does not automatically reload the unpacked extension.

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

## Resume extraction

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

## AI Resume Parsing

```http
POST /api/ai/resumes/parse
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

# Production Deployment

## Backend

The backend is deployed using Vercel.

Production:

[https://ai-powered-chrome-extension-api.vercel.app](https://ai-powered-chrome-extension-api.vercel.app)

---

## Vercel Root Directory

Because this repository is a monorepo:

```text
apps/api
```

is configured as the backend project's root directory.

---

## Production Environment Variables

Configured in Vercel:

```text
NODE_ENV=production

MONGODB_URI=<secret>

GEMINI_API_KEY=<secret>

GEMINI_MODEL=gemini-2.5-flash

CLIENT_ORIGIN=<configured origin>
```

Secrets must never be committed to Git.

---

## Express + Vercel

The Express application is default-exported from:

```text
apps/api/src/app.ts
```

This allows Vercel to invoke the Express application as a serverless function.

Local execution still uses:

```text
apps/api/src/server.ts
```

---

## MongoDB in Serverless Runtime

Vercel does not execute the local server startup flow in the same way as:

```bash
npm run dev:api
```

Therefore database connectivity is established in the Vercel request path.

Connection reuse prevents unnecessary duplicate MongoDB connections.

---

## MongoDB Atlas Network Access

The production Vercel runtime requires Atlas network access.

For the assessment/demo environment, Atlas may contain:

```text
0.0.0.0/0
```

to allow serverless Vercel infrastructure to reach MongoDB.

This configuration should always be combined with:

- strong database credentials,
- secrets stored only in environment variables,
- least-privilege database users where possible.

For a real production environment, more restrictive networking is preferred when infrastructure permits it.

---

# Testing

The project uses multiple testing layers.

---

## TypeScript Build

Backend:

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

## Git whitespace validation

```bash
git diff --check
```

---

## Resume Parsing Tests

Validated with real:

```text
PDF resume
DOCX resume
```

Both formats successfully produced extracted resume text.

---

## Gemini Tests

Both PDF and DOCX resumes were successfully converted into structured candidate profiles.

Validated information included:

```text
Name
Email
Phone
Summary
Skills
Experience
Education
Certifications
```

---

## MongoDB Tests

Verified:

```text
POST candidate
GET candidate
Invalid candidate ID
```

---

## Production API Test

Verified:

```text
GET /api/health
```

against Vercel.

Expected:

```text
database = connected
```

---

## Chrome Extension Test

Verified:

```text
Backend → Connected
```

against the production Vercel API.

---

## Safety / Regression Testing

Phase 14 introduced additional safety and regression coverage around Workday behavior.

Important safety expectations include:

- do not bypass login
- do not bypass CAPTCHA
- do not bypass MFA
- do not infer sensitive EEO values
- do not overwrite safe prefilled fields unnecessarily
- do not submit without explicit confirmation

---

# Security

## Gemini Key

The Gemini API key exists only in backend environment variables.

It must never be embedded inside:

```text
Chrome extension
Frontend bundle
Git repository
```

---

## MongoDB Credentials

MongoDB credentials are stored through:

```text
MONGODB_URI
```

inside environment configuration.

---

## Chrome Storage

Extension state is stored using:

```text
chrome.storage.local
```

This is used for extension state and candidate references.

Sensitive backend secrets are not stored there.

---

## Authentication

The extension does not bypass authentication.

The user manually handles:

```text
Workday sign-in
Account creation
CAPTCHA
MFA
Security challenges
```

---

# Phase-by-Phase Development History

This project was intentionally developed in small, testable phases.

Each major phase has its own Git commit.

---

## Phase 1 — Project Foundation

Created the initial monorepo foundation.

Included:

- npm workspaces
- React/Vite extension
- Node/Express API skeleton
- shared packages
- docs
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
- global error handling
- 404 handling
- clean startup/shutdown flow

Commit:

[`a3b0b75` — phase 2: build backend foundation](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/a3b0b7535584d8c3f2c5f5a382ca3cbba206f6ea)

---

## Phase 3 — Resume Parsing and Candidate Profiles

Implemented:

- PDF parsing
- DOCX parsing
- upload validation
- candidate TypeScript types
- Zod candidate schema
- Mongoose candidate model
- candidate persistence
- candidate retrieval
- invalid ObjectId handling

Commit:

[`43b3c6f` — phase 3: add resume parsing and candidate profiles](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/43b3c6feaa4e657f358f74d9cc17e1a65a8da677)

---

## Phase 4 — Gemini Resume Understanding

Implemented:

- Google Gemini client
- resume parsing prompt
- structured AI output
- Gemini candidate schema
- candidate normalization
- Gemini → Zod validation
- AI resume endpoint
- MongoDB persistence of AI-generated candidate profile

Commit:

[`d02e9c8` — phase 4: add Gemini resume understanding](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/d02e9c8f7b2106db1bbb56a05abbd9d39180355a)

---

## Phase 5 — Chrome Extension Foundation

Implemented:

- Manifest V3
- popup interface
- service worker
- content script
- Chrome storage
- runtime messaging
- backend health status
- Workday host permissions
- Workday page detection

Commit:

[`d57156b` — phase 5: build Chrome extension foundation](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/d57156b5a12ab028d89820504ee88d96d8c140ca)

---

## Phase 6 — Workday DOM Scanner

Implemented Workday page scanning and normalized representation of application form controls.

Commit:

[`94e6f8a` — phase 6: add Workday DOM scanner](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/94e6f8a3e65c89fe2baa4684f35f5bc30ef2bd27)

---

## Phase 7 — Semantic Field Mapping

Implemented semantic mapping between Workday fields and structured candidate data.

Commit:

[`c0b9e0c` — phase 7: add semantic field mapping](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/c0b9e0c1bd88a5bb8b638d42e89d27fd4d1d2fd3)

---

## Phase 8 — Safe Workday Autofill

Implemented confidence-aware Workday field filling.

Key goals:

- avoid unsafe guesses
- avoid overwriting valid values
- dispatch appropriate DOM events
- fill only sufficiently confident mappings

Commit:

[`c2ba11b` — phase 8: add safe Workday autofill engine](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/c2ba11b60949159b08cc93094cec15c87785e287)

---

## Phase 9 — Dynamic and Repeatable Workday Sections

Added support for dynamically rendered Workday sections and repeated Experience/Education structures.

Commit:

[`4fe0d1d` — phase 9: add dynamic repeatable Workday sections](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/4fe0d1d78362189c0d60f28a9930efaf19838f19)

---

## Phase 10 — Multi-Step Workday Navigator

Added page-state detection and navigation controls for multi-step Workday applications.

Commit:

[`e11896c` — phase 10: add multi-step Workday navigator](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/e11896cdfb6f10b22c433b0d179392dade3ca087)

---

## Phase 11 — Workday Question Detection and Classification

Added detection/classification for application questions, including conservative handling of sensitive and uncertain information.

Commit:

[`6149f67` — phase 11: add Workday question detection and classification](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/6149f6705dcb2a0080d72e09bcbf3bbe6e4316eb)

---

## Phase 12 — Validation and Error Recovery

Added Workday validation scanning and safer recovery behavior before navigation.

Commit:

[`703b1c8` — phase 12: add Workday validation and error recovery](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/703b1c8b775cb890c4d511416a0b473e50840c28)

---

## Phase 13 — Final Review and Explicit Submission

Added final review scanning and explicit confirmation protection before Workday submission.

Commit:

[`0138339` — phase 13: add final review and explicit submission](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/013833976b906f4d2e70e50206bedb5819e276be)

---

## Phase 14 — Testing and Safety Hardening

Added regression tests and safety protections around the Workday automation flow.

Commit:

[`a201c62` — phase 14: add Workday safety and regression tests](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/a201c62a9be47ec4d22c852e62fbe1dfd9d5cb09)

---

# Deployment Fixes

After Phase 14, the backend was prepared for Vercel production deployment.

---

## Express Vercel Export

Vercel requires a compatible Express export.

Commit:

[`9c7d9e1` — fix: export Express app for Vercel](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/9c7d9e19f1cb82fe711be97405314c1b4446dc45)

---

## MongoDB Connection in Vercel Runtime

Added MongoDB connectivity for the serverless Vercel execution path.

Commit:

[`ad3e601` — fix: connect MongoDB in Vercel runtime](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/commit/ad3e6013ca04668c3712a0cbcac10aa4515fbb7b)

---

## Phase 15 — Documentation, Packaging and Submission

Phase 15 focuses on:

- complete README
- architecture documentation
- AI strategy documentation
- testing documentation
- limitations documentation
- production deployment documentation
- demo flow
- extension packaging
- final submission checklist

This is the final planned development phase.

---

# Known Limitations

## Workday DOM Changes

Workday can change its DOM structure.

Selectors and semantic scanning therefore require continued maintenance.

---

## Company-Specific Workday Configuration

Different employers may configure Workday differently.

The extension is designed to be adaptable, but full compatibility cannot be guaranteed across every tenant without testing.

---

## Resume Formatting

Highly visual resumes may produce extraction artifacts.

Examples:

```text
A KSHAY
R AM
C HAVAN
```

AI normalization can repair obvious formatting problems, but accuracy depends on extraction quality.

---

## Hidden Hyperlinks

PDF/DOCX text extraction may return:

```text
LinkedIn
GitHub
Portfolio
```

without the underlying URL.

The AI intentionally avoids inventing URLs when the URL itself cannot be extracted.

---

## CAPTCHA and MFA

The system does not automate or bypass:

```text
CAPTCHA
MFA
Authentication challenges
```

---

## Sensitive Questions

The extension does not infer unknown sensitive demographic information.

These fields require manual candidate input.

---

## Final Submission

Submission intentionally requires explicit confirmation.

This is a safety feature, not a limitation to be removed casually.

---

# Future Improvements

Potential future improvements include:

- stronger Shadow DOM traversal
- configurable field confidence thresholds
- candidate profile editor
- extension-side resume upload
- multiple saved candidate profiles
- encrypted local candidate cache
- application history
- application status tracking
- richer question-answer generation
- per-company Workday adapters
- improved date normalization
- phone-number normalization
- stronger URL extraction
- extension onboarding flow
- automatic deployment environment selection
- telemetry with explicit opt-in
- Chrome Web Store packaging
- additional E2E Workday tenant coverage

---

# Demo Flow

A recommended demo recording sequence:

## 1. Project Introduction

Explain:

```text
Problem
Architecture
Technology stack
Safety philosophy
```

---

## 2. Show Backend

Open:

[Production health endpoint](https://ai-powered-chrome-extension-api.vercel.app/api/health)

Show:

```text
success: true
database: connected
```

---

## 3. Resume Parsing

Upload PDF/DOCX through the resume AI endpoint.

Explain:

```text
Resume
 ↓
Parser
 ↓
Gemini
 ↓
Zod
 ↓
MongoDB
```

---

## 4. Show Candidate JSON

Demonstrate:

```text
name
email
phone
skills
experience
education
```

---

## 5. Show Chrome Extension

Open the popup.

Show:

```text
Backend → Connected
Candidate ID
```

---

## 6. Open Workday

Open the selected Workday application.

Show:

```text
Workday page → Detected
```

---

## 7. Scan Page

Click:

```text
Scan Workday page
```

Explain DOM scanning.

---

## 8. Map Fields

Click:

```text
Map fields to candidate
```

Explain semantic mapping and confidence.

---

## 9. Autofill

Click:

```text
Autofill safe fields
```

Explain why only high-confidence fields are filled.

---

## 10. Experience and Education

Demonstrate repeatable section handling.

---

## 11. Questions

Demonstrate question detection.

Explain that uncertain/sensitive questions require user review.

---

## 12. Validation

Run:

```text
Validate Current Step
```

Show validation/error recovery.

---

## 13. Navigation

Demonstrate multi-step Workday navigation.

---

## 14. Final Review

Run:

```text
Scan Final Review
```

---

## 15. Submission Safety

Explain:

```text
No silent submission.
Explicit user confirmation is mandatory.
```

This should be highlighted in the demo.

---

# Final Submission Checklist

Before final submission verify:

- [ ] GitHub repository is public/access-approved
- [ ] README is complete
- [ ] `.env` is not committed
- [ ] MongoDB credentials are not committed
- [ ] Gemini API key is not committed
- [ ] production API is healthy
- [ ] MongoDB reports connected
- [ ] extension build succeeds
- [ ] backend build succeeds
- [ ] TypeScript typecheck succeeds
- [ ] tests succeed
- [ ] unpacked extension loads without Manifest errors
- [ ] extension shows Backend Connected
- [ ] Workday detection works
- [ ] DOM scanning works
- [ ] semantic mapping works
- [ ] safe autofill works
- [ ] repeatable Experience/Education flow tested
- [ ] navigation tested
- [ ] application questions tested
- [ ] validation tested
- [ ] final review tested
- [ ] explicit submission confirmation tested
- [ ] target Workday company documented
- [ ] demo video recorded
- [ ] final extension build packaged
- [ ] final ZIP/source package prepared
- [ ] final repository pushed

---

# Important Development Commands

## Install

```bash
npm install
```

## Backend development

```bash
npm run dev:api
```

## Backend build

```bash
npm run build:api
```

## Backend typecheck

```bash
npm --workspace apps/api run typecheck
```

## Extension development

```bash
npm run dev:extension
```

Note:

The Vite development page is not the real Chrome extension runtime.

Chrome APIs such as:

```ts
chrome.runtime
```

only work when the built application is loaded as a Chrome extension.

---

## Extension build

```bash
npm run build:extension
```

---

## Git verification

```bash
git diff --check
git status
```

---

# Git Repository

Repository:

[https://github.com/akshaychavan23031998/AI-powered-Chrome-extension](https://github.com/akshaychavan23031998/AI-powered-Chrome-extension)

---

# Production API

Backend:

[https://ai-powered-chrome-extension-api.vercel.app](https://ai-powered-chrome-extension-api.vercel.app)

Health:

[https://ai-powered-chrome-extension-api.vercel.app/api/health](https://ai-powered-chrome-extension-api.vercel.app/api/health)

---

# Engineering Principles Used

Throughout the project, several principles guided implementation.

## Safety over aggressive automation

The extension should rather leave an uncertain field empty than insert incorrect candidate information.

---

## Deterministic before AI

AI is useful for semantic interpretation, but not every field requires AI.

---

## Validate AI output

AI output always passes through deterministic application validation.

---

## Modular architecture

Responsibilities are separated into:

```text
Parser
AI Understanding
Candidate Model
Scanner
Mapper
Filler
Navigator
Validator
Review
Submission Guard
```

---

## Backend secrets stay backend-only

Gemini and database credentials are never exposed inside the extension bundle.

---

## User remains in control

The extension assists the user.

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

Explore the portfolio for additional projects, technical experience, skills, case studies, and software engineering work.

---

# Final Note

This project was built incrementally from a blank monorepo into a complete AI-assisted Workday automation system.

The major engineering journey was:

```text
Project Foundation
       ↓
Backend Foundation
       ↓
Resume Parsing
       ↓
Gemini Resume Understanding
       ↓
Chrome Extension
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
Explicit Submission
       ↓
Testing & Safety Hardening
       ↓
Production Deployment
       ↓
Documentation & Submission Readiness
```

The most important architectural principle remains:

> **Understand first. Map carefully. Automate safely. Keep the user in control.**