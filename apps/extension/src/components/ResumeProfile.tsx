import {
  useRef,
  useState,
} from "react";

import type {
  CandidateSummary,
} from "../types/extension-state";

interface ResumeProfileProps {
  candidate?: CandidateSummary;

  processing: boolean;

  disabled: boolean;

  onProcessResume: (
    file: File,
  ) => Promise<void>;
}

const ACCEPTED_TYPES =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function ResumeProfile({
  candidate,
  processing,
  disabled,
  onProcessResume,
}: ResumeProfileProps) {
  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<File>();

  const hasCandidate =
    Boolean(
      candidate?.candidateId,
    );

  const candidateName = [
    candidate?.firstName,
    candidate?.middleName,
    candidate?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const visibleSkills =
    candidate?.skills
      ?.filter(Boolean)
      .slice(0, 6) ?? [];

  const selectResume =
    (): void => {
      inputRef.current?.click();
    };

  const processResume =
    async (): Promise<void> => {
      if (!selectedFile) {
        return;
      }

      await onProcessResume(
        selectedFile,
      );

      setSelectedFile(
        undefined,
      );

      if (
        inputRef.current
      ) {
        inputRef.current.value =
          "";
      }
    };

  return (
    <section className="candidate-section">
      <p className="status-label">
        Candidate Profile
      </p>

      <input
        ref={inputRef}
        className="resume-file-input"
        type="file"
        accept={ACCEPTED_TYPES}
        disabled={
          disabled ||
          processing
        }
        onChange={(event) => {
          const file =
            event.target.files?.[0];

          setSelectedFile(
            file,
          );
        }}
      />

      {hasCandidate ? (
        <div className="resume-profile-card">
          <p className="resume-ready">
            ✓ Resume ready
          </p>

          {candidateName && (
            <p className="resume-candidate-name">
              {candidateName}
            </p>
          )}

          {candidate?.title && (
            <p className="resume-candidate-title">
              {
                candidate.title
              }
            </p>
          )}

          {candidate?.email && (
            <p className="resume-candidate-email">
              {
                candidate.email
              }
            </p>
          )}

          {visibleSkills.length >
            0 && (
            <p className="resume-skills">
              {visibleSkills.join(
                " · ",
              )}
            </p>
          )}

          {candidate?.resumeFileName && (
            <p className="resume-file-name">
              Resume:{" "}
              {
                candidate.resumeFileName
              }
            </p>
          )}

          <button
            type="button"
            className="secondary-button"
            disabled={
              disabled ||
              processing
            }
            onClick={
              selectResume
            }
          >
            Replace Resume
          </button>

          {selectedFile && (
            <>
              <p className="resume-file-name">
                Selected:{" "}
                {
                  selectedFile.name
                }
              </p>

              <button
                type="button"
                className="primary-button"
                disabled={
                  disabled ||
                  processing
                }
                onClick={() =>
                  void processResume()
                }
              >
                {processing
                  ? "Processing Resume..."
                  : "Process New Resume"}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="resume-upload-card">
          <p className="mapping-empty">
            Upload a PDF or DOCX resume
            to create your candidate
            profile.
          </p>

          <button
            type="button"
            className="secondary-button"
            disabled={
              disabled ||
              processing
            }
            onClick={
              selectResume
            }
          >
            Choose Resume
          </button>

          {selectedFile && (
            <>
              <p className="resume-file-name">
                Selected:{" "}
                {
                  selectedFile.name
                }
              </p>

              <button
                type="button"
                className="primary-button"
                disabled={
                  disabled ||
                  processing
                }
                onClick={() =>
                  void processResume()
                }
              >
                {processing
                  ? "Processing Resume..."
                  : "Process Resume"}
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}