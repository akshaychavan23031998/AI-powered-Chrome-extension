import path from "node:path";

import multer from "multer";

import { ApiError } from "../utils/api-error.js";

const MAX_RESUME_SIZE_BYTES =
  5 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const allowedExtensions = new Set([
  ".pdf",
  ".docx",
]);

const storage = multer.memoryStorage();

export const resumeUpload = multer({
  storage,

  limits: {
    fileSize: MAX_RESUME_SIZE_BYTES,
    files: 1,
  },

  fileFilter: (
    _req,
    file,
    callback,
  ) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const validMimeType =
      allowedMimeTypes.has(file.mimetype);

    const validExtension =
      allowedExtensions.has(extension);

    if (!validMimeType && !validExtension) {
      callback(
        new ApiError(
          400,
          "Only PDF and DOCX resume files are supported.",
        ),
      );

      return;
    }

    callback(null, true);
  },
});