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
        data.status ===
          "healthy" &&
        data.database ===
          "connected"
      );
    } catch {
      return false;
    }
  };