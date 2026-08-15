import { z } from "zod";

const cleanString =
  z.string().default("");

const workExperienceSchema =
  z.object({
    company: cleanString,
    title: cleanString,
    location: cleanString,
    startDate: cleanString,
    endDate: cleanString,

    current: z
      .boolean()
      .default(false),

    description: cleanString,

    skills: z
      .array(z.string())
      .default([]),
  });

const educationSchema =
  z.object({
    institution: cleanString,
    degree: cleanString,
    fieldOfStudy: cleanString,
    location: cleanString,
    startDate: cleanString,
    endDate: cleanString,
    grade: cleanString,
    description: cleanString,
  });

const certificationSchema =
  z.object({
    name: cleanString,
    issuer: cleanString,
    issueDate: cleanString,
    expirationDate: cleanString,
    credentialId: cleanString,
    credentialUrl: cleanString,
  });

export const geminiCandidateSchema =
  z.object({
    firstName: cleanString,
    middleName: cleanString,
    lastName: cleanString,

    email: cleanString,
    phone: cleanString,

    location: z.object({
      addressLine1: cleanString,
      addressLine2: cleanString,
      city: cleanString,
      state: cleanString,
      postalCode: cleanString,
      country: cleanString,
    }),

    links: z.object({
      linkedin: cleanString,
      github: cleanString,
      portfolio: cleanString,
      website: cleanString,
    }),

    summary: cleanString,

    skills: z
      .array(z.string())
      .default([]),

    experience: z
      .array(
        workExperienceSchema,
      )
      .default([]),

    education: z
      .array(educationSchema)
      .default([]),

    certifications: z
      .array(
        certificationSchema,
      )
      .default([]),
  });

export type GeminiCandidate =
  z.infer<
    typeof geminiCandidateSchema
  >;