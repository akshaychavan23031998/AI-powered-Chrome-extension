import type {
  CandidateProfile,
} from "../types/candidate";

import type {
  DomFieldDescriptor,
} from "../types/dom-field";

import type {
  FieldMappingResult,
} from "../types/mapping";

const API_BASE_URL =
  "https://ai-powered-chrome-extension-api.vercel.app/api";

interface HealthResponse {
  success: boolean;

  service: string;

  status: string;

  database:
    | "connected"
    | "disconnected";

  timestamp: string;
}

interface MappingApiResponse {
  success: boolean;

  message: string;

  data: FieldMappingResult;
}

interface CandidateApiResponse {
  success: boolean;

  data?: CandidateProfile;

  message?: string;

  error?: string;
}

interface ResumeParseApiResponse {
  success: boolean;

  message?: string;

  data?: {
    candidateId: string;

    profile: CandidateProfile;
  };

  error?: string;
}

export interface ResumeParseResult {
  candidateId: string;

  profile: CandidateProfile;
}

export const checkBackendHealth =
  async (): Promise<boolean> => {
    try {
      const response =
        await fetch(
          `${API_BASE_URL}/health`,
        );

      if (!response.ok) {
        return false;
      }

      const data =
        (await response.json()) as HealthResponse;

      return (
        data.success === true &&
        data.status === "healthy" &&
        data.database === "connected"
      );
    } catch {
      return false;
    }
  };

export const uploadAndParseResume =
  async (
    file: File,
  ): Promise<ResumeParseResult> => {
    const formData =
      new FormData();

    formData.append(
      "resume",
      file,
    );

    const response =
      await fetch(
        `${API_BASE_URL}/ai/resumes/parse`,
        {
          method: "POST",

          body: formData,
        },
      );

    const data =
      (await response.json()) as ResumeParseApiResponse;

    if (
      !response.ok ||
      !data.success ||
      !data.data
    ) {
      throw new Error(
        data.message ??
          data.error ??
          "Unable to process resume.",
      );
    }

    return {
      candidateId:
        data.data.candidateId,

      profile:
        data.data.profile,
    };
  };

export const mapFields =
  async (
    candidateId: string,
    fields: DomFieldDescriptor[],
  ): Promise<FieldMappingResult> => {
    const response =
      await fetch(
        `${API_BASE_URL}/ai/fields/map`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            candidateId,
            fields,
          }),
        },
      );

    const data =
      (await response.json()) as
        | MappingApiResponse
        | {
            success: false;
            message?: string;
          };

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        "message" in data &&
        data.message
          ? data.message
          : "Field mapping failed.",
      );
    }

    return data.data;
  };

export const getCandidateProfile =
  async (
    candidateId: string,
  ): Promise<CandidateProfile> => {
    const response =
      await fetch(
        `${API_BASE_URL}/candidates/${encodeURIComponent(
          candidateId,
        )}`,
      );

    const data =
      (await response.json()) as CandidateApiResponse;

    if (
      !response.ok ||
      !data.success ||
      !data.data
    ) {
      throw new Error(
        data.message ??
          data.error ??
          "Unable to load candidate profile.",
      );
    }

    return data.data;
  };