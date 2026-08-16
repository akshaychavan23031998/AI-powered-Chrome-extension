import {
  Router,
} from "express";

import {
  mapWorkdayFields,
} from "../controllers/field-mapping.controller.js";

export const fieldMappingRouter =
  Router();

fieldMappingRouter.post(
  "/map",
  mapWorkdayFields,
);