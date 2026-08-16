import { env } from "../../config/env.js";
import { geminiClient } from "../../config/gemini.js";

import {
  buildFieldMapperPrompt,
} from "../../prompts/field-mapper.prompt.js";

import type {
  ScannedField,
} from "../../schemas/field-mapping.schema.js";

import { ApiError } from "../../utils/api-error.js";

interface GeminiFieldMapping {
  fieldId: string;

  targetPath: string;

  confidence: number;

  reason: string;
}

const responseSchema = {
  type: "object",

  properties: {
    mappings: {
      type: "array",

      items: {
        type: "object",

        properties: {
          fieldId: {
            type: "string",
          },

          targetPath: {
            type: "string",
          },

          confidence: {
            type: "number",
          },

          reason: {
            type: "string",
          },
        },

        required: [
          "fieldId",
          "targetPath",
          "confidence",
          "reason",
        ],
      },
    },
  },

  required: [
    "mappings",
  ],
} as const;

export const mapFieldsWithGemini =
  async (
    fields: ScannedField[],
  ): Promise<
    GeminiFieldMapping[]
  > => {
    if (
      fields.length === 0
    ) {
      return [];
    }

    try {
      const response =
        await geminiClient.models.generateContent({
          model:
            env.GEMINI_MODEL,

          contents:
            buildFieldMapperPrompt(
              fields,
            ),

          config: {
            responseMimeType:
              "application/json",

            responseSchema,

            temperature: 0.1,
          },
        });

      if (!response.text) {
        throw new ApiError(
          502,
          "Gemini returned an empty field-mapping response.",
        );
      }

      const parsed =
        JSON.parse(
          response.text,
        ) as {
          mappings?: GeminiFieldMapping[];
        };

      if (
        !Array.isArray(
          parsed.mappings,
        )
      ) {
        throw new ApiError(
          502,
          "Gemini returned an invalid field-mapping response.",
        );
      }

      return parsed.mappings.map(
        (mapping) => ({
          ...mapping,

          confidence:
            Math.max(
              0,
              Math.min(
                1,
                mapping.confidence,
              ),
            ),
        }),
      );
    } catch (error) {
      if (
        error instanceof
        ApiError
      ) {
        throw error;
      }

      console.error(
        "Gemini field mapping failed:",
        error,
      );

      throw new ApiError(
        502,
        "Unable to map Workday fields with Gemini.",
      );
    }
  };