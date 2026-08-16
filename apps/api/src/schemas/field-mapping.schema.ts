import { z } from "zod";

export const scannedFieldSchema =
  z.object({
    id: z.string().min(1),

    kind: z.string().min(1),

    tagName:
      z.string().min(1),

    inputType:
      z.string().optional(),

    name:
      z.string().optional(),

    label:
      z.string().default(""),

    placeholder:
      z.string().optional(),

    ariaLabel:
      z.string().optional(),

    required:
      z.boolean(),

    disabled:
      z.boolean(),

    readOnly:
      z.boolean(),

    visible:
      z.boolean(),

    hasValue:
      z.boolean(),

    value:
      z.string().optional(),

    section:
      z.string().optional(),

    selectorHint:
      z.string().optional(),
  });

export const mapFieldsRequestSchema =
  z.object({
    candidateId:
      z.string().min(1),

    fields:
      z.array(
        scannedFieldSchema,
      ),
  });

export type ScannedField =
  z.infer<
    typeof scannedFieldSchema
  >;

export type MapFieldsRequest =
  z.infer<
    typeof mapFieldsRequestSchema
  >;