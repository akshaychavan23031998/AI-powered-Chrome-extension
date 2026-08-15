import mongoose, {
  Schema,
  type InferSchemaType,
} from "mongoose";

const locationSchema = new Schema(
  {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  {
    _id: false,
  },
);

const linksSchema = new Schema(
  {
    linkedin: String,
    github: String,
    portfolio: String,
    website: String,
  },
  {
    _id: false,
  },
);

const experienceSchema = new Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    location: String,

    startDate: String,

    endDate: {
      type: String,
      default: null,
    },

    current: {
      type: Boolean,
      default: false,
    },

    description: String,

    skills: {
      type: [String],
      default: [],
    },
  },
  {
    _id: true,
  },
);

const educationSchema = new Schema(
  {
    institution: {
      type: String,
      required: true,
      trim: true,
    },

    degree: String,
    fieldOfStudy: String,
    location: String,

    startDate: String,
    endDate: String,

    grade: String,
    description: String,
  },
  {
    _id: true,
  },
);

const certificationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    issuer: String,

    issueDate: String,
    expirationDate: String,

    credentialId: String,
    credentialUrl: String,
  },
  {
    _id: true,
  },
);

const candidateSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    middleName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    location: {
      type: locationSchema,
      default: undefined,
    },

    links: {
      type: linksSchema,
      default: {},
    },

    summary: {
      type: String,
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: [experienceSchema],
      default: [],
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    certifications: {
      type: [certificationSchema],
      default: [],
    },

    resume: {
      fileName: String,
      mimeType: String,
      fileSize: Number,
      extractedText: String,
    },
  },
  {
    timestamps: true,
  },
);

export type CandidateDocument =
  InferSchemaType<typeof candidateSchema>;

export const Candidate =
  mongoose.models.Candidate ??
  mongoose.model(
    "Candidate",
    candidateSchema,
  );