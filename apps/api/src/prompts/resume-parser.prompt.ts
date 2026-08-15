export const buildResumeParserPrompt = (
  resumeText: string,
): string => {
  return `
You are an expert resume parser.

Your task is to convert the supplied resume text into structured candidate data.

STRICT RULES:

1. Extract only information that is explicitly present or strongly supported by the resume.

2. Never invent:
- employers
- job titles
- dates
- education
- skills
- certifications
- URLs
- contact information
- locations

3. If information is unavailable:
- use an empty string for optional scalar fields
- use an empty array for lists
- use false when a boolean cannot reasonably be true

4. Normalize obvious formatting artifacts from PDF or DOCX extraction.

Example:
"A KSHAY R AM C HAVAN"
may represent:
"Akshay Ram Chavan"

Only repair such artifacts when the resume clearly supports the correction.

5. Preserve employer names, institution names and job titles accurately.

6. Dates should preferably use:
YYYY-MM
when month and year are known.

If only a year or textual date is available, preserve a useful normalized textual representation.

7. For current employment:
current = true
endDate = ""

Otherwise:
current = false

8. Extract skills as concise technology or professional skill names.

9. Do not add generic skills that are not present in the resume.

10. URLs must only be returned when the actual URL appears in the extracted text.

Do not infer LinkedIn, GitHub, portfolio, or website URLs merely because the words "LinkedIn", "GitHub", or "Portfolio" appear.

11. A certification must only be included if the resume actually contains a certification.

12. Do not confuse projects with work experience.

13. Do not confuse profile summaries with experience descriptions.

14. Return data matching the required JSON schema exactly.

RESUME TEXT:

---------------- RESUME START ----------------

${resumeText}

----------------- RESUME END -----------------
`;
};