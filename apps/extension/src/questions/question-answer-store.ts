import type {
  QuestionAnswerProfile,
  SavedQuestionAnswer,
} from "../types/question";

const STORAGE_KEY =
  "workdayAiQuestionAnswers";

const EMPTY_PROFILE:
  QuestionAnswerProfile = {
    answers: [],
  };

export const getQuestionAnswerProfile =
  async (): Promise<QuestionAnswerProfile> => {
    const stored =
      await chrome.storage.local.get(
        STORAGE_KEY,
      );

    const value =
      stored[
        STORAGE_KEY
      ] as
        | QuestionAnswerProfile
        | undefined;

    if (
      !value ||
      !Array.isArray(
        value.answers,
      )
    ) {
      return {
        ...EMPTY_PROFILE,
      };
    }

    return {
      answers:
        value.answers.filter(
          (answer) =>
            Boolean(
              answer.value,
            ) &&
            answer.explicitUserAnswer ===
              true,
        ),
    };
  };

export const saveQuestionAnswers =
  async (
    answers:
      SavedQuestionAnswer[],
  ): Promise<QuestionAnswerProfile> => {
    const safeAnswers =
      answers.filter(
        (answer) =>
          Boolean(
            answer.value.trim(),
          ) &&
          answer.explicitUserAnswer ===
            true,
      );

    const profile:
      QuestionAnswerProfile = {
      answers:
        safeAnswers,
    };

    await chrome.storage.local.set({
      [STORAGE_KEY]:
        profile,
    });

    return profile;
  };

export const clearQuestionAnswers =
  async (): Promise<void> => {
    await chrome.storage.local.remove(
      STORAGE_KEY,
    );
  };