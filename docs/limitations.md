# Limitations

## 1. Overview

The Workday AI Application Assistant significantly reduces repetitive job-application work, but it operates against third-party web applications and uses probabilistic AI.

For that reason, some limitations are unavoidable.

These limitations are documented intentionally so that users and developers understand the boundary between:

```text
reliable automation
```

and:

```text
areas requiring human review
```

The project prioritizes:

```text
correctness
safety
transparency
user control
```

over maximum automation.

---

# 2. Workday Tenant Variability

Workday is highly configurable.

Different companies can configure:

- different sections,
- different required fields,
- different labels,
- different custom questions,
- different page order,
- different field types,
- different dropdowns,
- different validation rules.

Therefore a workflow that works on one Workday tenant may require adaptation on another tenant.

---

# 3. Workday DOM Changes

The extension interacts with a third-party website whose frontend can change independently of this project.

Workday may update:

```text
DOM hierarchy
CSS classes
ARIA attributes
component implementation
button labels
navigation structure
field rendering
```

A major Workday UI update may require scanner or filler adjustments.

---

# 4. Hardcoded Host Scope

The extension currently targets Workday host patterns such as:

```text
*.myworkdayjobs.com
*.workday.com
```

A Workday deployment hosted under an unexpected domain may not be detected automatically until the manifest and detection rules are updated.

---

# 5. Dynamic Rendering

Workday frequently renders content asynchronously.

Examples:

- delayed inputs,
- changing steps,
- dynamic validation,
- added experience sections,
- added education sections,
- custom dropdown menus.

The project uses `MutationObserver` and controlled waits, but browser/network timing can still vary.

---

# 6. Race Conditions

Dynamic UI automation can experience race conditions.

Example:

```text
Extension clicks Add Experience
        ↓
Expected section has not rendered yet
        ↓
Scanner runs too early
```

Retry/wait strategies reduce this risk but cannot eliminate every timing issue across all tenants and devices.

---

# 7. Shadow DOM

Some modern components may use Shadow DOM.

Standard DOM scanning does not automatically penetrate all closed or deeply nested shadow roots.

The project can be extended with stronger Shadow DOM traversal if required by specific Workday components.

---

# 8. Custom Workday Components

Not every Workday input is a native HTML control.

For example, a dropdown can visually behave like a select while internally using:

```text
div
button
listbox
option-like elements
```

Such controls may require component-specific interaction rather than ordinary native `select.value` behavior.

---

# 9. Date Control Variability

Dates can be represented as:

```text
text input
month dropdown
year dropdown
date picker
separate month/day/year controls
custom Workday widget
```

A single date-filling strategy may not work across every Workday tenant.

---

# 10. Resume PDF Extraction Quality

PDF is primarily a visual document format.

Text extraction can therefore produce:

- incorrect reading order,
- broken spaces,
- mixed columns,
- icon artifacts,
- missing links,
- separated name characters,
- concatenated words.

Example:

```text
A KSHAY R AM C HAVAN
```

instead of:

```text
Akshay Ram Chavan
```

AI can normalize obvious artifacts, but it cannot perfectly recover information that was not extracted correctly.

---

# 11. DOCX Extraction Quality

DOCX usually provides cleaner text than PDF, but formatting can still introduce:

- paragraph fragmentation,
- missing spacing,
- merged words,
- section ordering differences.

The AI normalization layer improves consistency but cannot guarantee visually identical document reconstruction.

---

# 12. Image-Based Resumes

A scanned PDF may contain only images instead of extractable text.

The current primary resume pipeline does not rely on OCR.

Therefore:

```text
image-only PDF
```

may produce insufficient resume text.

OCR could be added as a future fallback.

---

# 13. Hidden Hyperlinks

A resume can contain a clickable label such as:

```text
LinkedIn
GitHub
Portfolio
```

while text extraction returns only the visible label.

The underlying hyperlink may be lost.

The AI intentionally does not invent a URL in this case.

Therefore some valid candidate links may remain empty even though they exist visually in the original document.

---

# 14. Resume Layout Complexity

Highly designed resumes can use:

- multiple columns,
- tables,
- floating text,
- icons,
- sidebars,
- graphical timelines.

These layouts can reduce extraction quality.

Simpler text-oriented resumes generally produce more reliable parser output.

---

# 15. AI Is Probabilistic

Gemini is not completely deterministic.

Two valid parsing requests may differ slightly in:

- formatting,
- spacing,
- capitalization,
- selected skill wording,
- description formatting,
- phone normalization.

Example:

```text
+918180004924
```

versus:

```text
+91 8180004924
```

These differences do not necessarily indicate incorrect semantic extraction.

---

# 16. AI Hallucination Risk

Large language models can generate unsupported information.

The project reduces this risk using:

- strict prompts,
- structured output,
- low temperature,
- Zod validation,
- normalization,
- explicit "do not invent" rules.

However, no AI system can guarantee zero hallucination under all inputs.

Critical information should still be reviewable by the candidate.

---

# 17. Schema Validation Does Not Prove Factual Accuracy

Zod can verify:

```text
field type
required structure
array shape
object shape
```

but it cannot independently prove that:

```text
a job title was correctly extracted from the resume
```

Therefore structural validation and factual correctness are related but different concerns.

---

# 18. Missing Candidate Facts

Some Workday questions require information that is commonly absent from resumes.

Examples:

```text
work authorization
visa sponsorship
expected salary
notice period
willingness to relocate
preferred start date
previous employment with company
```

The system should not guess these values.

Manual candidate input may be necessary.

---

# 19. Sensitive Candidate Information

The system intentionally does not infer:

```text
gender
race
ethnicity
disability
veteran status
religion
sexual orientation
medical information
```

This limitation is deliberate.

The absence of automatic completion for these fields is a safety requirement.

---

# 20. EEO Questions

Equal Employment Opportunity and voluntary disclosure questions can vary by employer and jurisdiction.

The extension can detect/classify these questions, but unknown personal answers must remain user-controlled.

---

# 21. Legal Declarations

Some Workday applications include declarations such as:

```text
I certify that the information above is correct.
```

These statements have legal or attestational significance.

They should not be treated as ordinary factual resume fields.

Explicit user interaction may be required.

---

# 22. Work Authorization

Work authorization should not be inferred from:

```text
candidate location
university
employer history
name
```

A candidate working in a country does not necessarily prove their legal work status.

Manual or explicitly stored profile data is required.

---

# 23. Sponsorship

Likewise:

```text
Do you now or in the future require sponsorship?
```

cannot reliably be answered using resume history alone.

The system should avoid speculative answers.

---

# 24. Subjective Questions

Questions such as:

```text
Why do you want to work here?
Why are you interested in this role?
Describe a challenging project.
```

cannot be represented as simple candidate profile fields.

AI could generate suggestions, but subjective responses should remain reviewable.

---

# 25. Job Description Context

Some custom questions require understanding the specific job.

Candidate profile alone may be insufficient.

Future improvements could combine:

```text
Candidate Profile
+
Job Description
+
Company Context
+
Application Question
```

before generating a suggested answer.

---

# 26. Existing Workday Profile Data

Workday may prefill information from:

- previous applications,
- account profile,
- browser autofill,
- saved candidate information.

The extension tries to preserve valid existing values.

However, the system cannot always determine whether an existing value is current or outdated.

The user remains responsible for final verification.

---

# 27. Confidence Threshold Tradeoff

A high autofill confidence threshold provides more safety but fills fewer fields.

```text
Higher threshold
       ↓
Fewer automated fields
       ↓
Lower mapping risk
```

A lower threshold increases automation but may increase wrong mappings.

The implementation intentionally prefers safety.

---

# 28. Semantic Ambiguity

Some labels are inherently ambiguous.

Example:

```text
Professional Profile
```

could mean:

```text
LinkedIn
portfolio
personal website
GitHub
```

The system may intentionally leave such a field unresolved when confidence is insufficient.

---

# 29. Repeatable Section Differences

Experience and Education structures can vary by tenant.

Different Workday applications may request:

```text
company
title
location
start date
end date
description
currently employed
reason for leaving
industry
```

The current repeatable-section architecture handles common structures but cannot guarantee every custom field.

---

# 30. Entry Count Differences

Candidate profile data and existing Workday profile entries can conflict.

Example:

```text
Candidate JSON = 3 jobs
Existing Workday profile = 2 jobs
```

Automatically determining whether to:

```text
add
replace
merge
skip
```

can require manual review.

---

# 31. Duplicate Experience Risk

If Workday already contains candidate experience from a previous application, blindly adding resume experiences could create duplicates.

The extension therefore needs conservative repeatable-section behavior.

---

# 32. File Upload Restrictions

Browsers intentionally restrict file input automation for security reasons.

The extension must not bypass browser protections.

Resume/document upload may require user-driven file selection depending on the workflow.

---

# 33. Authentication Is Outside Automation Scope

The extension does not bypass:

```text
login
password
account creation verification
CAPTCHA
MFA
OTP
security challenge
```

Authentication remains a manual user responsibility.

---

# 34. CAPTCHA

CAPTCHA automation is not part of this system.

If CAPTCHA is displayed:

```text
automation pauses
user completes CAPTCHA
automation continues afterward
```

where appropriate.

---

# 35. MFA

The project does not attempt to:

- intercept OTP codes,
- approve authentication requests,
- bypass authenticator apps,
- bypass security keys.

The user must complete MFA manually.

---

# 36. Account Creation

Some Workday applications require creating an account.

The system may detect that the expected application page is unavailable, but account creation flows can differ substantially.

User involvement is expected.

---

# 37. Navigation Ambiguity

A Workday page may contain multiple buttons:

```text
Save
Save and Continue
Continue
Next
Back
Cancel
Review
```

The navigation system uses semantics, but unfamiliar tenant-specific wording can still require manual interaction.

---

# 38. Submission Button Variability

Final submission controls can use labels such as:

```text
Submit
Submit Application
Finish
Complete
```

The project intentionally treats submission conservatively.

---

# 39. Explicit Confirmation Requirement

The project is not intended as a fully autonomous job-application bot.

Submission requires explicit user confirmation.

This is not considered a defect.

It is a deliberate safety boundary.

---

# 40. No Bulk Autonomous Job Applying

The project is not designed to:

```text
find hundreds of jobs
apply to all of them
submit applications without review
```

Its objective is:

```text
assist a candidate while completing an application
```

rather than replacing the candidate.

---

# 41. Chrome-First Support

The extension is built using:

```text
Chrome Manifest V3
```

and Chrome-specific APIs.

Primary target:

```text
Google Chrome / Chromium
```

Firefox and Safari compatibility is not guaranteed.

---

# 42. Unpacked Extension Distribution

During development and assessment testing, the extension is loaded through:

```text
chrome://extensions
→ Developer mode
→ Load unpacked
```

using:

```text
apps/extension/dist
```

This is different from production Chrome Web Store distribution.

---

# 43. Chrome Web Store Publication

Publishing to the Chrome Web Store would require additional release work such as:

- extension icons,
- privacy policy,
- listing description,
- screenshots,
- permission justification,
- store package,
- review process.

The current assessment implementation focuses on functional extension delivery.

---

# 44. Extension Reload Requirement

After rebuilding:

```bash
npm run build:extension
```

Chrome does not automatically load the new JavaScript.

The developer must reload the extension through:

```text
chrome://extensions
```

This is expected behavior during unpacked extension development.

---

# 45. Vite Development Page Limitation

Running:

```bash
npm run dev:extension
```

creates a standard Vite web page.

Chrome extension APIs such as:

```text
chrome.runtime
chrome.storage
chrome.tabs
```

are not available in a normal `localhost:5173` tab.

The actual extension must be tested from the Chrome extension runtime.

---

# 46. Backend Availability

The production extension depends on:

```text
https://ai-powered-chrome-extension-api.vercel.app
```

If the backend is unavailable:

- health checks fail,
- candidate requests fail,
- AI mapping requests can fail.

The extension should fail safely rather than continue with missing backend state.

---

# 47. Vercel Cold Starts

Serverless platforms can introduce cold-start latency.

First request latency may include:

```text
Node runtime startup
MongoDB connection
route initialization
```

Subsequent requests may be faster when runtime instances are reused.

---

# 48. MongoDB Availability

Candidate profile retrieval depends on MongoDB Atlas.

An Atlas outage or networking failure can prevent:

```text
candidate creation
candidate retrieval
health status
```

from working.

---

# 49. MongoDB Network Access

For the current Vercel deployment, Atlas networking must allow Vercel's runtime to reach the cluster.

Broad rules such as:

```text
0.0.0.0/0
```

can simplify serverless connectivity during assessment/demo deployment.

For a production system, the most restrictive practical network policy should be used.

---

# 50. Gemini Availability

Resume understanding depends on Google's Gemini API.

Potential external failures include:

```text
quota exhaustion
rate limits
temporary outage
model unavailability
network error
timeout
```

The backend must treat these as controlled failures.

---

# 51. Model Lifecycle

AI model availability and recommended model names can change over time.

Because the model is configured through:

```text
GEMINI_MODEL
```

it can be changed without rewriting the entire application.

Still, a future model change should be regression tested.

---

# 52. Internet Dependency

Production behavior requires network access to:

```text
Workday
Vercel
MongoDB Atlas
Gemini
```

The project is not designed for offline operation.

---

# 53. Candidate Data Privacy

Resumes contain personally identifiable information.

Examples:

```text
name
email
phone
employment
education
location
```

The assessment implementation demonstrates secure architectural boundaries, but a commercial production version should additionally define:

- retention policy,
- candidate deletion,
- encryption requirements,
- access control,
- audit logs,
- consent,
- privacy policy,
- regional compliance requirements.

---

# 54. Local Chrome Storage

The extension uses:

```text
chrome.storage.local
```

for extension state.

This is appropriate for persistent extension configuration/state, but highly sensitive secrets should not be stored there.

Backend credentials are intentionally not stored in Chrome storage.

---

# 55. Candidate ID Workflow

The current user workflow primarily works with a candidate identifier.

A richer application could add:

```text
profile selector
candidate list
profile editor
resume upload directly from popup
multi-profile support
```

Those features are outside the current core assessment scope.

---

# 56. No Universal ATS Support

The project is designed specifically around Workday.

It does not currently provide adapters for:

```text
Greenhouse
Lever
Taleo
SmartRecruiters
iCIMS
```

Supporting additional ATS platforms would require additional platform-specific scanning and navigation logic.

---

# 57. Manual Testing Remains Necessary

Unit and regression tests cannot fully simulate every real Workday tenant.

Before relying on a release, real browser testing remains necessary.

This is particularly important for:

- custom controls,
- dynamic rendering,
- tenant-specific questions,
- navigation,
- final review.

---

# 58. Workday Terms and Platform Rules

The project technically automates browser interactions, but users and deployers remain responsible for ensuring their use complies with relevant Workday/employer terms and applicable rules.

The extension is designed as a user-controlled assistant rather than an evasion tool.

---

# 59. No Guarantee of Universal Autofill Accuracy

Even with:

```text
AI
heuristics
confidence
validation
```

no system can guarantee perfect form interpretation across arbitrary dynamic third-party pages.

The architecture therefore includes manual review as a first-class part of the workflow.

---

# 60. Final Limitation Philosophy

These limitations reflect the project's core design philosophy.

The goal is not:

```text
fill everything at any cost
```

The goal is:

```text
understand what can be filled safely
fill those values
surface uncertainty
preserve user control
prevent unsafe submission
```

The guiding rule is:

> **When the system does not know enough, it should stop and ask rather than guess.**
