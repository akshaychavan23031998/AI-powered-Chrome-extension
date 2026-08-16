import { getCandidateById } from "../candidate/candidate.service.js";

import { mapFieldsWithGemini } from "../ai/gemini-field-mapper.service.js";

import type {
  ScannedField,
} from "../../schemas/field-mapping.schema.js";

import type {
  CandidateFieldMapping,
  FieldMappingResult,
} from "../../types/field-mapping.types.js";

import { ApiError } from "../../utils/api-error.js";

import {
  buildCandidateValueMap,
  mapFieldHeuristically,
} from "./heuristic-field-mapper.service.js";

const AI_ALLOWED_PATHS =
  new Set([
    "firstName",
    "middleName",
    "lastName",
    "email",
    "phone",

    "location.addressLine1",
    "location.addressLine2",
    "location.city",
    "location.state",
    "location.postalCode",
    "location.country",

    "links.linkedin",
    "links.github",
    "links.portfolio",
    "links.website",

    "summary",
  ]);

const getAiCandidateFields = (
  fields: ScannedField[],
  existingMappings:
    CandidateFieldMapping[],
): ScannedField[] => {
  const resolved =
    new Set(
      existingMappings.map(
        (mapping) =>
          mapping.fieldId,
      ),
    );

  return fields.filter(
    (field) =>
      !resolved.has(field.id) &&
      field.visible &&
      !field.disabled &&
      !field.readOnly &&
      !field.hasValue,
  );
};

export const mapCandidateToFields =
  async (
    candidateId: string,
    fields: ScannedField[],
  ): Promise<FieldMappingResult> => {
    const candidate =
      await getCandidateById(
        candidateId,
      );

    if (!candidate) {
      throw new ApiError(
        404,
        "Candidate profile not found.",
      );
    }

    const candidateObject =
      candidate.toObject() as Record<
        string,
        unknown
      >;

    const candidateValues =
      buildCandidateValueMap(
        candidateObject,
      );

    const mappings:
      CandidateFieldMapping[] =
      [];

    const unresolvedFields:
      ScannedField[] = [];

    for (
      const field of fields
    ) {
      const heuristic =
        mapFieldHeuristically(
          field,
          candidateValues,
        );

      if (heuristic) {
        mappings.push(
          heuristic,
        );

        continue;
      }

      unresolvedFields.push(
        field,
      );
    }

    const aiFields =
      getAiCandidateFields(
        unresolvedFields,
        mappings,
      );

    if (
      aiFields.length > 0
    ) {
      const aiMappings =
        await mapFieldsWithGemini(
          aiFields,
        );

      const aiByFieldId =
        new Map(
          aiMappings.map(
            (mapping) => [
              mapping.fieldId,
              mapping,
            ],
          ),
        );

      for (
        const field of aiFields
      ) {
        const ai =
          aiByFieldId.get(
            field.id,
          );

        if (
          !ai ||
          !ai.targetPath ||
          !AI_ALLOWED_PATHS.has(
            ai.targetPath,
          )
        ) {
          mappings.push({
            fieldId:
              field.id,

            label:
              field.label,

            kind:
              field.kind,

            confidence: 0,

            source:
              "unmapped",

            reason:
              ai?.reason ??
              "No safe semantic mapping found.",

            requiresReview:
              field.required,

            shouldFill: false,
          });

          continue;
        }

        const value =
          candidateValues[
            ai.targetPath
          ];

        if (
          !value?.trim()
        ) {
          mappings.push({
            fieldId:
              field.id,

            label:
              field.label,

            kind:
              field.kind,

            targetPath:
              ai.targetPath,

            confidence:
              ai.confidence,

            source:
              "ai",

            reason:
              `Candidate profile has no value for ${ai.targetPath}.`,

            requiresReview:
              field.required,

            shouldFill: false,
          });

          continue;
        }

        mappings.push({
          fieldId:
            field.id,

          label:
            field.label,

          kind:
            field.kind,

          targetPath:
            ai.targetPath,

          value,

          confidence:
            ai.confidence,

          source:
            "ai",

          reason:
            ai.reason,

          requiresReview:
            ai.confidence <
            0.8,

          shouldFill:
            ai.confidence >=
            0.65,
        });
      }
    }

    const mappedIds =
      new Set(
        mappings.map(
          (mapping) =>
            mapping.fieldId,
        ),
      );

    for (
      const field of fields
    ) {
      if (
        mappedIds.has(field.id)
      ) {
        continue;
      }

      mappings.push({
        fieldId:
          field.id,

        label:
          field.label,

        kind:
          field.kind,

        confidence: 0,

        source:
          "unmapped",

        reason:
          "No candidate-backed mapping available.",

        requiresReview:
          field.required,

        shouldFill: false,
      });
    }

    const mapped =
      mappings.filter(
        (mapping) =>
          mapping.targetPath &&
          mapping.value &&
          mapping.shouldFill,
      );

    return {
      candidateId,

      totalFields:
        fields.length,

      mappedCount:
        mapped.length,

      highConfidenceCount:
        mapped.filter(
          (mapping) =>
            mapping.confidence >=
            0.9,
        ).length,

      reviewCount:
        mappings.filter(
          (mapping) =>
            mapping.requiresReview,
        ).length,

      mappings,
    };
  };