import type {
  CandidateProfileInput,
} from "../../schemas/candidate.schema.js";

import type {
  GeminiCandidate,
} from "../../schemas/gemini-candidate.schema.js";

const optionalText = (
  value: string,
): string | undefined => {
  const normalized =
    value.trim();

  return normalized ||
    undefined;
};

const uniqueStrings = (
  values: string[],
): string[] => {
  const seen =
    new Set<string>();

  const result: string[] = [];

  for (
    const value of values
  ) {
    const normalized =
      value.trim();

    if (!normalized) {
      continue;
    }

    const key =
      normalized.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(normalized);
  }

  return result;
};

export const normalizeGeminiCandidate = (
  candidate: GeminiCandidate,
): CandidateProfileInput => {
  const location = {
    addressLine1:
      optionalText(
        candidate.location
          .addressLine1,
      ),

    addressLine2:
      optionalText(
        candidate.location
          .addressLine2,
      ),

    city:
      optionalText(
        candidate.location.city,
      ),

    state:
      optionalText(
        candidate.location.state,
      ),

    postalCode:
      optionalText(
        candidate.location
          .postalCode,
      ),

    country:
      optionalText(
        candidate.location.country,
      ),
  };

  const hasLocation =
    Object.values(
      location,
    ).some(Boolean);

  return {
    firstName:
      candidate.firstName.trim(),

    middleName:
      optionalText(
        candidate.middleName,
      ),

    lastName:
      candidate.lastName.trim(),

    email:
      optionalText(
        candidate.email,
      ),

    phone:
      optionalText(
        candidate.phone,
      ),

    ...(hasLocation && {
      location,
    }),

    links: {
      linkedin:
        optionalText(
          candidate.links.linkedin,
        ),

      github:
        optionalText(
          candidate.links.github,
        ),

      portfolio:
        optionalText(
          candidate.links.portfolio,
        ),

      website:
        optionalText(
          candidate.links.website,
        ),
    },

    summary:
      optionalText(
        candidate.summary,
      ),

    skills:
      uniqueStrings(
        candidate.skills,
      ),

    experience:
      candidate.experience
        .filter(
          (experience) =>
            experience.company.trim() &&
            experience.title.trim(),
        )
        .map(
          (experience) => ({
            company:
              experience.company.trim(),

            title:
              experience.title.trim(),

            location:
              optionalText(
                experience.location,
              ),

            startDate:
              optionalText(
                experience.startDate,
              ),

            endDate:
              experience.current
                ? null
                : optionalText(
                    experience.endDate,
                  ),

            current:
              experience.current,

            description:
              optionalText(
                experience.description,
              ),

            skills:
              uniqueStrings(
                experience.skills,
              ),
          }),
        ),

    education:
      candidate.education
        .filter(
          (education) =>
            education.institution
              .trim(),
        )
        .map(
          (education) => ({
            institution:
              education.institution
                .trim(),

            degree:
              optionalText(
                education.degree,
              ),

            fieldOfStudy:
              optionalText(
                education.fieldOfStudy,
              ),

            location:
              optionalText(
                education.location,
              ),

            startDate:
              optionalText(
                education.startDate,
              ),

            endDate:
              optionalText(
                education.endDate,
              ),

            grade:
              optionalText(
                education.grade,
              ),

            description:
              optionalText(
                education.description,
              ),
          }),
        ),

    certifications:
      candidate.certifications
        .filter(
          (certification) =>
            certification.name
              .trim(),
        )
        .map(
          (
            certification,
          ) => ({
            name:
              certification.name.trim(),

            issuer:
              optionalText(
                certification.issuer,
              ),

            issueDate:
              optionalText(
                certification.issueDate,
              ),

            expirationDate:
              optionalText(
                certification
                  .expirationDate,
              ),

            credentialId:
              optionalText(
                certification
                  .credentialId,
              ),

            credentialUrl:
              optionalText(
                certification
                  .credentialUrl,
              ),
          }),
        ),
  };
};