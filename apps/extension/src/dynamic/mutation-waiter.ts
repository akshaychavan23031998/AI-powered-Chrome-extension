export interface MutationWaitOptions {
  timeoutMs?: number;

  root?: Node;
}

export const waitForDomMutation = (
  options: MutationWaitOptions = {},
): Promise<boolean> => {
  const timeoutMs =
    options.timeoutMs ?? 5000;

  const root =
    options.root ??
    document.documentElement;

  return new Promise(
    (resolve) => {
      let settled = false;

      const observer =
        new MutationObserver(
          () => {
            if (settled) {
              return;
            }

            settled = true;

            window.clearTimeout(
              timeoutId,
            );

            observer.disconnect();

            resolve(true);
          },
        );

      observer.observe(
        root,
        {
          childList: true,
          subtree: true,
          attributes: true,
        },
      );

      const timeoutId =
        window.setTimeout(
          () => {
            if (settled) {
              return;
            }

            settled = true;

            observer.disconnect();

            resolve(false);
          },
          timeoutMs,
        );
    },
  );
};

export const waitForCondition =
  async (
    condition: () => boolean,
    timeoutMs = 5000,
    intervalMs = 100,
  ): Promise<boolean> => {
    const startedAt =
      Date.now();

    while (
      Date.now() -
        startedAt <
      timeoutMs
    ) {
      if (condition()) {
        return true;
      }

      await new Promise<void>(
        (resolve) => {
          window.setTimeout(
            resolve,
            intervalMs,
          );
        },
      );
    }

    return false;
  };