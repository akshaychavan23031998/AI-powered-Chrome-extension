import type {
  Request,
  Response,
} from "express";

import {
  mapFieldsRequestSchema,
} from "../schemas/field-mapping.schema.js";

import {
  mapCandidateToFields,
} from "../services/mapping/field-mapping.service.js";

export const mapWorkdayFields =
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const input =
      mapFieldsRequestSchema.parse(
        req.body,
      );

    const result =
      await mapCandidateToFields(
        input.candidateId,
        input.fields,
      );

    res.status(200).json({
      success: true,

      message:
        "Workday fields mapped successfully.",

      data: result,
    });
  };