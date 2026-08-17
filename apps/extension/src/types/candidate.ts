export interface CandidateExperience {
  company?: string;

  title?: string;

  location?: string;

  startDate?: string;

  endDate?: string;

  current?: boolean;

  description?: string;

  skills?: string[];
}

export interface CandidateEducation {
  institution?: string;

  degree?: string;

  fieldOfStudy?: string;

  location?: string;

  startDate?: string;

  endDate?: string;

  grade?: string;
}

export interface CandidateResume {
  fileName?: string;

  mimeType?: string;

  fileSize?: number;
}

export interface CandidateProfile {
  _id: string;

  firstName?: string;

  middleName?: string;

  lastName?: string;

  email?: string;

  phone?: string;

  summary?: string;

  skills?: string[];

  experience?: CandidateExperience[];

  education?: CandidateEducation[];

  certifications?: unknown[];

  resume?: CandidateResume;
}