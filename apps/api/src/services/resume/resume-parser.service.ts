import path from "node:path";

import mammoth from "mammoth";

import {
  ApiError,
} from "../../utils/api-error.js";

const PDF_MIME_TYPE =
  "application/pdf";

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const normalizeExtractedText = (
  value: string,
): string => {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const extractPdfText = async (
  buffer: Buffer,
): Promise<string> => {
  try {
    /*
     * Load pdf-parse only when a PDF is actually processed.
     *
     * Keeping this out of the module-level imports prevents
     * serverless runtimes from loading PDF/native dependencies
     * for DOCX and unrelated API requests.
     */
    await import(
      "pdf-parse/worker"
    );

    const {
      PDFParse,
    } = await import(
      "pdf-parse"
    );

    const parser =
      new PDFParse({
        data: buffer,
      });

    try {
      const result =
        await parser.getText();

      return normalizeExtractedText(
        result.text,
      );
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    console.error(
      "PDF resume extraction failed:",
      error,
    );

    throw new ApiError(
      422,
      "Unable to extract text from the PDF resume.",
    );
  }
};

const extractDocxText = async (
  buffer: Buffer,
): Promise<string> => {
  try {
    const result =
      await mammoth.extractRawText({
        buffer,
      });

    return normalizeExtractedText(
      result.value,
    );
  } catch (error) {
    console.error(
      "DOCX resume extraction failed:",
      error,
    );

    throw new ApiError(
      422,
      "Unable to extract text from the DOCX resume.",
    );
  }
};

export interface ResumeExtractionResult {
  text: string;

  file: {
    originalName: string;
    mimeType: string;
    size: number;
  };
}

export const extractResumeText = async (
  file: Express.Multer.File,
): Promise<ResumeExtractionResult> => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const isPdf =
    file.mimetype === PDF_MIME_TYPE ||
    extension === ".pdf";

  const isDocx =
    file.mimetype === DOCX_MIME_TYPE ||
    extension === ".docx";

  let text: string;

  if (isPdf) {
    text = await extractPdfText(
      file.buffer,
    );
  } else if (isDocx) {
    text = await extractDocxText(
      file.buffer,
    );
  } else {
    throw new ApiError(
      400,
      "Unsupported resume file type.",
    );
  }

  if (!text) {
    throw new ApiError(
      422,
      "No readable text could be extracted from the resume.",
    );
  }

  return {
    text,

    file: {
      originalName:
        file.originalname,

      mimeType:
        file.mimetype,

      size:
        file.size,
    },
  };
};