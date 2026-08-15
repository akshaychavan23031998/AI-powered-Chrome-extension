export interface CandidateLocation {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CandidateLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  current: boolean;
  description?: string;
  skills: string[];
}

export interface Education {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  issueDate?: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface CandidateProfile {
  firstName: string;
  middleName?: string;
  lastName: string;

  email?: string;
  phone?: string;

  location?: CandidateLocation;

  links: CandidateLinks;

  summary?: string;

  skills: string[];

  experience: WorkExperience[];

  education: Education[];

  certifications: Certification[];
}