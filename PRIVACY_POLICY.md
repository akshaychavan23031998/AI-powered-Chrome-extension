# Privacy Policy

**Workday AI Application Assistant**

**Effective date:** August 17, 2026

## 1. Overview

Workday AI Application Assistant is a Chrome extension designed to assist users with reviewing and completing Workday job application forms using candidate information derived from their resume and stored candidate profile.

The extension is designed as a user-controlled application assistant.

It does not operate as an autonomous job application bot and does not submit an application without explicit user confirmation.

This Privacy Policy explains what information the extension processes, why that information is processed, how it is transmitted and stored, and the limits of the extension's use of personal data.

---

## 2. Information Processed

The extension may process information necessary to provide resume-aware Workday application assistance.

This can include:

### Candidate profile information

- name
- email address
- phone number
- location
- professional summary
- skills
- employment history
- education history
- certifications
- professional profile links
- resume metadata

### Workday application information

The extension may inspect information available on the Workday application page currently opened by the user, including:

- form field labels
- form field types
- current form values
- required field indicators
- validation messages
- Workday navigation controls
- application questions
- Experience sections
- Education sections
- review-page information

The extension only operates on supported Workday domains.

---

## 3. Why Information Is Processed

Candidate and Workday application information is processed only to provide the extension's core functionality.

This includes:

- understanding candidate information derived from a resume
- storing a structured candidate profile
- identifying Workday application fields
- mapping candidate profile data to appropriate Workday fields
- filling high-confidence fields
- handling Experience and Education sections
- identifying application questions
- validating application steps
- assisting with final application review

Data is not collected for advertising or behavioral profiling.

---

## 4. Resume Processing

The application supports PDF and DOCX resumes.

Resume text may be extracted using server-side document parsing tools.

Extracted resume text may then be processed through an AI model to convert the resume into structured candidate information.

The purpose of this processing is limited to creating and using the candidate profile required for job application assistance.

---

## 5. AI Processing

The backend uses Google Gemini for selected AI-assisted functionality.

AI processing may include:

- interpreting resume text
- converting unstructured resume information into structured candidate data
- assisting with semantic mapping between candidate information and Workday form fields

The system is designed to minimize unnecessary AI processing.

Deterministic and heuristic logic is used when AI is not required.

AI output is validated before being accepted by the application.

---

## 6. Information Sent to the Backend

The Chrome extension communicates with the Workday AI Application Assistant backend over HTTPS.

The production backend is hosted at:

`https://ai-powered-chrome-extension-api.vercel.app`

Information transmitted to the backend may include:

- candidate ID
- normalized Workday field metadata
- field labels
- field types
- information required for candidate-field mapping

The extension does not intentionally transmit passwords, authentication cookies, CAPTCHA responses, MFA codes, or other authentication credentials.

---

## 7. Data Storage

Structured candidate profiles may be stored in MongoDB Atlas.

Candidate information may contain personal information derived from the user's resume.

The extension also uses Chrome local storage for limited extension state, such as:

- selected candidate ID
- backend connection status
- Workday page detection state
- extension runtime state

API keys and database credentials are not stored inside Chrome local storage.

---

## 8. Data Sharing

Candidate information is not sold.

Candidate information is not used for advertising.

Candidate information is not shared with data brokers.

Information may be processed by infrastructure and service providers required to operate the extension, including:

- Vercel, for backend hosting
- MongoDB Atlas, for candidate profile storage
- Google Gemini, for AI-assisted processing

These services are used only as necessary to provide the extension's functionality.

---

## 9. Sensitive Information

The extension is intentionally designed not to infer unknown sensitive personal characteristics.

This includes information such as:

- race
- ethnicity
- religion
- disability status
- veteran status
- gender
- sexual orientation
- health information

If such information is requested in a Workday application and is not explicitly available from the candidate, the extension leaves the decision to the user.

---

## 10. Authentication Information

The extension does not attempt to bypass or automate security mechanisms such as:

- passwords
- CAPTCHA
- MFA
- OTP verification
- security challenges
- authentication approval
- identity verification

Authentication remains under the user's control.

---

## 11. Existing Workday Data

Workday may already contain information from:

- previous applications
- a saved Workday profile
- browser autofill
- user-entered values

The extension is designed to avoid unnecessarily overwriting valid existing values.

Users should still review all information before continuing or submitting an application.

---

## 12. Application Submission

The extension does not silently submit Workday applications.

Final submission requires explicit confirmation from the user.

The extension provides a final review stage before submission.

The user remains responsible for verifying the accuracy of all submitted information.

---

## 13. Data Retention

Candidate profiles may remain stored in the backend database while the service is being used.

A future production version may provide self-service candidate profile deletion and configurable retention periods.

Users who want their stored candidate information removed may contact the project maintainer.

---

## 14. Security

The project uses security controls intended to reduce unauthorized access and exposure.

These include:

- HTTPS communication between the extension and backend
- server-side storage of service credentials
- environment-variable based secret management
- no Gemini API key inside the Chrome extension
- no MongoDB credentials inside the Chrome extension
- validation of AI-generated structured data
- restricted Chrome extension host permissions

No internet-based system can guarantee absolute security.

---

## 15. Chrome Permissions

The extension requests only permissions required for its functionality.

### `storage`

Used to retain limited extension state and the selected candidate identifier.

### `activeTab`

Used to identify and interact with the Workday application tab actively selected by the user.

### `scripting`

Used to support user-initiated interaction with supported Workday application pages.

### Workday host access

The extension requests access to:

`https://*.myworkdayjobs.com/*`

and:

`https://*.workday.com/*`

This access is required to scan, validate, and assist with Workday job application pages.

### Backend host access

The extension requests access to:

`https://ai-powered-chrome-extension-api.vercel.app/*`

This access is required to communicate with the production backend.

---

## 16. No Sale or Advertising Use

User information is not sold.

User information is not used to deliver targeted advertising.

User information is not transferred for advertising measurement or marketing profiling.

The extension's data processing is limited to providing Workday application assistance.

---

## 17. User Responsibilities

Users should review all autofilled information before proceeding through a Workday application.

AI-generated or automatically mapped information may not always be correct.

The user is responsible for ensuring the accuracy of the final application before submission.

---

## 18. Changes to This Privacy Policy

This Privacy Policy may be updated when the extension's functionality, infrastructure, or data practices change.

Material changes should be reflected in the public project documentation and the effective date above.

---

## 19. Open Source Project

The source code for Workday AI Application Assistant is publicly available on GitHub:

`https://github.com/akshaychavan23031998/AI-powered-Chrome-extension`

Users and reviewers can inspect the implementation and documented architecture.

---

## 20. Contact

For privacy questions, data deletion requests, security concerns, or project-related inquiries, contact:

**Akshay Ram Chavan**

GitHub:

`https://github.com/akshaychavan23031998`

Project repository:

`https://github.com/akshaychavan23031998/AI-powered-Chrome-extension`