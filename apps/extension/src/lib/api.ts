import type {
  DomFieldDescriptor,
} from "../types/dom-field";

import type {
  FieldMappingResult,
} from "../types/mapping";

const API_BASE_URL =
  "http://localhost:4000/api";

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