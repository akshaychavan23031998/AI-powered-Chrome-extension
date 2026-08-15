import path from "node:path";

import mammoth from "mammoth";

import { ApiError } from "../../utils/api-error.js";

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
  const pdfjs = await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  );

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
  });

  const pdfDocument =
    await loadingTask.promise;

  const pages: string[] = [];

  for (
    let pageNumber = 1;
    pageNumber <= pdfDocument.numPages;
    pageNumber += 1
  ) {
    const page =
      await pdfDocument.getPage(pageNumber);

    const content =
      await page.getTextContent();

    const pageText = content.items
      .map((item) => {
        if ("str" in item) {
          return item.str;
        }

        return "";
      })
      .join(" ");

    pages.push(pageText);
  }

  return normalizeExtractedText(
    pages.join("\n\n"),
  );
};

const extractDocxText = async (
  buffer: Buffer,
): Promise<string> => {
  const result =
    await mammoth.extractRawText({
      buffer,
    });

  return normalizeExtractedText(
    result.value,
  );
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
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    },
  };
};