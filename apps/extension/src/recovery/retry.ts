import type {
  RecoveryAttempt,
  RecoveryResult,
  RetryOptions,
} from "../types/recovery";

const sleep = (
  milliseconds: number,
): Promise<void> => {
  return new Promise(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
};

export const retryOperation =
  async <T>(
    operation: (
      attempt: number,
    ) => Promise<T> | T,

    isSuccessful: (
      result: T,
    ) => boolean,

    options: RetryOptions = {},
  ): Promise<{
    result: T;
    attempts: RecoveryAttempt[];
  }> => {
    const maxAttempts =
      Math.max(
        1,
        options.attempts ?? 3,
      );

    const multiplier =
      Math.max(
        1,
        options.backoffMultiplier ?? 1.5,
      );

    let delay =
      Math.max(
        0,
        options.delayMs ?? 350,
      );

    const attempts:
      RecoveryAttempt[] = [];

    let lastResult:
      T | undefined;

    let lastError:
      unknown;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt += 1
    ) {
      try {
        const result =
          await operation(
            attempt,
          );

        lastResult =
          result;

        const success =
          isSuccessful(
            result,
          );

        attempts.push({
          attempt,
          success,
          message:
            success
              ? "Operation succeeded."
              : "Operation completed but success condition was not met.",
          timestamp:
            new Date().toISOString(),
        });

        if (
          success
        ) {
          return {
            result,
            attempts,
          };
        }
      } catch (
        error
      ) {
        lastError =
          error;

        attempts.push({
          attempt,
          success: false,
          message:
            error instanceof
              Error
              ? error.message
              : "Unknown retry operation error.",
          timestamp:
            new Date().toISOString(),
        });
      }

      if (
        attempt <
        maxAttempts
      ) {
        await sleep(
          delay,
        );

        delay =
          Math.round(
            delay *
              multiplier,
          );
      }
    }

    if (
      lastResult !==
      undefined
    ) {
      return {
        result:
          lastResult,
        attempts,
      };
    }

    if (
      lastError instanceof
      Error
    ) {
      throw lastError;
    }

    throw new Error(
      "Retry operation failed without producing a result.",
    );
  };

export const toRecoveryResult =
  (
    success: boolean,
    attempts:
      RecoveryAttempt[],
    successMessage: string,
    failureMessage: string,
  ): RecoveryResult => {
    return {
      success,

      reason:
        success
          ? undefined
          : "operation-failed",

      attempts,

      totalAttempts:
        attempts.length,

      finalMessage:
        success
          ? successMessage
          : failureMessage,
    };
  };

export const delay =
  sleep;