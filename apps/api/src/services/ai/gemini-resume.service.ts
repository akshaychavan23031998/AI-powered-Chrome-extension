import { env } from "../../config/env.js";
import { geminiClient } from "../../config/gemini.js";
import {
  geminiCandidateSchema,
  type GeminiCandidate,
} from "../../schemas/gemini-candidate.schema.js";
import { ApiError } from "../../utils/api-error.js";
import { buildResumeParserPrompt } from "../../prompts/resume-parser.prompt.js";

const candidateResponseSchema = {
  type: "object",

  properties: {
    firstName: {
      type: "string",
    },

    middleName: {
      type: "string",
    },

    lastName: {
      type: "string",
    },

    email: {
      type: "string",
    },

    phone: {
      type: "string",
    },

    location: {
      type: "object",

      properties: {
        addressLine1: {
          type: "string",
        },

        addressLine2: {
          type: "string",
        },

        city: {
          type: "string",
        },

        state: {
          type: "string",
        },

        postalCode: {
          type: "string",
        },

        country: {
          type: "string",
        },
      },

      required: [
        "addressLine1",
        "addressLine2",
        "city",
        "state",
        "postalCode",
        "country",
      ],
    },

    links: {
      type: "object",

      properties: {
        linkedin: {
          type: "string",
        },

        github: {
          type: "string",
        },

        portfolio: {
          type: "string",
        },

        website: {
          type: "string",
        },
      },

      required: [
        "linkedin",
        "github",
        "portfolio",
        "website",
      ],
    },

    summary: {
      type: "string",
    },

    skills: {
      type: "array",

      items: {
        type: "string",
      },
    },

    experience: {
      type: "array",

      items: {
        type: "object",

        properties: {
          company: {
            type: "string",
          },

          title: {
            type: "string",
          },

          location: {
            type: "string",
          },

          startDate: {
            type: "string",
          },

          endDate: {
            type: "string",
          },

          current: {
            type: "boolean",
          },

          description: {
            type: "string",
          },

          skills: {
            type: "array",

            items: {
              type: "string",
            },
          },
        },

        required: [
          "company",
          "title",
          "location",
          "startDate",
          "endDate",
          "current",
          "description",
          "skills",
        ],
      },
    },

    education: {
      type: "array",

      items: {
        type: "object",

        properties: {
          institution: {
            type: "string",
          },

          degree: {
            type: "string",
          },

          fieldOfStudy: {
            type: "string",
          },

          location: {
            type: "string",
          },

          startDate: {
            type: "string",
          },

          endDate: {
            type: "string",
          },

          grade: {
            type: "string",
          },

          description: {
            type: "string",
          },
        },

        required: [
          "institution",
          "degree",
          "fieldOfStudy",
          "location",
          "startDate",
          "endDate",
          "grade",
          "description",
        ],
      },
    },

    certifications: {
      type: "array",

      items: {
        type: "object",

        properties: {
          name: {
            type: "string",
          },

          issuer: {
            type: "string",
          },

          issueDate: {
            type: "string",
          },

          expirationDate: {
            type: "string",
          },

          credentialId: {
            type: "string",
          },

          credentialUrl: {
            type: "string",
          },
        },

        required: [
          "name",
          "issuer",
          "issueDate",
          "expirationDate",
          "credentialId",
          "credentialUrl",
        ],
      },
    },
  },

  required: [
    "firstName",
    "middleName",
    "lastName",
    "email",
    "phone",
    "location",
    "links",
    "summary",
    "skills",
    "experience",
    "education",
    "certifications",
  ],
} as const;

export const parseResumeWithGemini = async (
  resumeText: string,
): Promise<GeminiCandidate> => {
  if (!resumeText.trim()) {
    throw new ApiError(
      400,
      "Resume text is required for AI parsing.",
    );
  }

  try {
    const response =
      await geminiClient.models.generateContent({
        model:
          env.GEMINI_MODEL,

        contents:
          buildResumeParserPrompt(
            resumeText,
          ),

        config: {
          responseMimeType:
            "application/json",

          responseSchema:
            candidateResponseSchema,

          temperature: 0.1,
        },
      });

    const responseText =
      response.text;

    if (!responseText) {
      throw new ApiError(
        502,
        "Gemini returned an empty response.",
      );
    }

    let parsedJson: unknown;

    try {
      parsedJson =
        JSON.parse(
          responseText,
        );
    } catch {
      throw new ApiError(
        502,
        "Gemini returned invalid JSON.",
      );
    }

    const validated =
      geminiCandidateSchema.safeParse(
        parsedJson,
      );

    if (!validated.success) {
      throw new ApiError(
        502,
        "Gemini returned an invalid candidate structure.",
        validated.error.flatten(),
      );
    }

    return validated.data;
  } catch (error) {
    if (
      error instanceof
      ApiError
    ) {
      throw error;
    }

    console.error(
      "Gemini resume parsing failed:",
      error,
    );

    throw new ApiError(
      502,
      "Unable to parse resume with Gemini.",
    );
  }
};