import type {
  WaitOptions,
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

export const waitForCondition =
  async (
    condition: () => boolean,

    options: WaitOptions = {},
  ): Promise<boolean> => {
    const timeoutMs =
      Math.max(
        100,
        options.timeoutMs ?? 5000,
      );

    const intervalMs =
      Math.max(
        50,
        options.intervalMs ?? 150,
      );

    const startedAt =
      Date.now();

    while (
      Date.now() -
        startedAt <
      timeoutMs
    ) {
      try {
        if (
          condition()
        ) {
          return true;
        }
      } catch {
        // Dynamic Workday DOM may temporarily detach nodes.
        // Continue waiting until timeout.
      }

      await sleep(
        intervalMs,
      );
    }

    return false;
  };

export const waitForElement =
  async <T extends Element>(
    selector: string,

    options: WaitOptions = {},
  ): Promise<T | null> => {
    let found:
      T | null =
      document.querySelector<T>(
        selector,
      );

    if (
      found
    ) {
      return found;
    }

    const success =
      await waitForCondition(
        () => {
          found =
            document.querySelector<T>(
              selector,
            );

          return Boolean(
            found,
          );
        },
        options,
      );

    return (
      success
        ? found
        : null
    );
  };

export const waitForVisibleElement =
  async <T extends HTMLElement>(
    selector: string,

    options: WaitOptions = {},
  ): Promise<T | null> => {
    let found:
      T | null =
      null;

    const success =
      await waitForCondition(
        () => {
          const element =
            document.querySelector<T>(
              selector,
            );

          if (
            !element
          ) {
            return false;
          }

          const style =
            window.getComputedStyle(
              element,
            );

          const rect =
            element.getBoundingClientRect();

          const visible =
            style.display !==
              "none" &&
            style.visibility !==
              "hidden" &&
            rect.width >
              0 &&
            rect.height >
              0;

          if (
            visible
          ) {
            found =
              element;
          }

          return visible;
        },

        options,
      );

    return (
      success
        ? found
        : null
    );
  };

export const waitForDomMutation =
  (
    timeoutMs = 2500,
  ): Promise<boolean> => {
    return new Promise(
      (resolve) => {
        let settled =
          false;

        const finish = (
          mutated: boolean,
        ) => {
          if (
            settled
          ) {
            return;
          }

          settled =
            true;

          observer.disconnect();

          window.clearTimeout(
            timer,
          );

          resolve(
            mutated,
          );
        };

        const observer =
          new MutationObserver(
            () => {
              finish(
                true,
              );
            },
          );

        observer.observe(
          document.documentElement,
          {
            childList: true,
            subtree: true,
            attributes: true,
          },
        );

        const timer =
          window.setTimeout(
            () => {
              finish(
                false,
              );
            },
            timeoutMs,
          );
      },
    );
  };

export const waitForDomToSettle =
  async (
    settleMs = 300,
    timeoutMs = 4000,
  ): Promise<boolean> => {
    const startedAt =
      Date.now();

    let lastMutationAt =
      Date.now();

    const observer =
      new MutationObserver(
        () => {
          lastMutationAt =
            Date.now();
        },
      );

    observer.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true,
        attributes: true,
      },
    );

    try {
      while (
        Date.now() -
          startedAt <
        timeoutMs
      ) {
        if (
          Date.now() -
            lastMutationAt >=
          settleMs
        ) {
          return true;
        }

        await sleep(
          100,
        );
      }

      return false;
    } finally {
      observer.disconnect();
    }
  };