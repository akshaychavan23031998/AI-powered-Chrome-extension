import type {
  ErrorRequestHandler,
} from "express";

import multer from "multer";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export const errorHandler: ErrorRequestHandler =
  (
    error,
    _req,
    res,
    _next,
  ) => {
    if (
      error instanceof ApiError
    ) {
      res
        .status(
          error.statusCode,
        )
        .json({
          success: false,

          message:
            error.message,

          details:
            error.details,
        });

      return;
    }

    if (
      error instanceof ZodError
    ) {
      res.status(400).json({
        success: false,

        message:
          "Validation failed.",

        details:
          error.flatten(),
      });

      return;
    }

    if (
      error instanceof
      multer.MulterError
    ) {
      let message =
        error.message;

      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        message =
          "Resume file must be 5 MB or smaller.";
      }

      res.status(400).json({
        success: false,
        message,
        code:
          error.code,
      });

      return;
    }

    console.error(error);

    res.status(500).json({
      success: false,

      message:
        "Internal server error",

      ...(env.NODE_ENV ===
        "development" &&
        error instanceof Error && {
          stack:
            error.stack,
        }),
    });
  };