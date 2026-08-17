const PRIVACY_POLICY_URL =
  "https://github.com/akshaychavan23031998/AI-powered-Chrome-extension/blob/main/PRIVACY_POLICY.md";

export function PrivacyNotice() {
  return (
    <section className="privacy-notice">
      <p className="privacy-title">
        Privacy & Data Use
      </p>

      <p className="privacy-text">
        Candidate profile and Workday form
        information may be processed by the
        Workday AI Assistant backend to provide
        resume-aware field mapping and autofill.
        Data is not sold or used for advertising.
      </p>

      <p className="privacy-text">
        Sensitive information is not inferred,
        and final application submission requires
        explicit user confirmation.
      </p>

      <a
        className="privacy-link"
        href={PRIVACY_POLICY_URL}
        target="_blank"
        rel="noreferrer"
      >
        View Privacy Policy
      </a>
    </section>
  );
}