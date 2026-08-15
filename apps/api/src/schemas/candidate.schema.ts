import { z } from "zod";

const optionalText = z.string().trim().optional();

export const candidateLocationSchema = z.object({
  addressLine1: optionalText,
  addressLine2: optionalText,
  city: optionalText,
  state: optionalText,
  postalCode: optionalText,
  country: optionalText,
});

export const candidateLinksSchema = z.object({
  linkedin: optionalText,
  github: optionalText,
  portfolio: optionalText,
  website: optionalText,
});

export const workExperienceSchema = z.object({
  company: z.string().trim().min(1),
  title: z.string().trim().min(1),
  location: optionalText,
  startDate: optionalText,
  endDate: z.string().trim().nullable().optional(),
  current: z.boolean().default(false),
  description: optionalText,
  skills: z.array(z.string().trim().min(1)).default([]),
});

export const educationSchema = z.object({
  institution: z.string().trim().min(1),
  degree: optionalText,
  fieldOfStudy: optionalText,
  location: optionalText,
  startDate: optionalText,
  endDate: optionalText,
  grade: optionalText,
  description: optionalText,
});

export const certificationSchema = z.object({
  name: z.string().trim().min(1),
  issuer: optionalText,
  issueDate: optionalText,
  expirationDate: optionalText,
  credentialId: optionalText,
  credentialUrl: optionalText,
});

export const candidateProfileSchema = z.object({
  firstName: z.string().trim().min(1),
  middleName: optionalText,
  lastName: z.string().trim().min(1),

  email: z.string().trim().email().optional(),
  phone: optionalText,

  location: candidateLocationSchema.optional(),

  links: candidateLinksSchema.default({}),

  summary: optionalText,

  skills: z.array(z.string().trim().min(1)).default([]),
  experience: z.array(workExperienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
});

export type CandidateProfileInput =
  z.input<typeof candidateProfileSchema>;

export type CandidateProfileOutput =
  z.output<typeof candidateProfileSchema>;