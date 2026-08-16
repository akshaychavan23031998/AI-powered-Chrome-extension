type DynamicPageListener =
  () => void;

let observer:
  MutationObserver | undefined;

const listeners =
  new Set<
    DynamicPageListener
  >();

let debounceTimer:
  number | undefined;

const notifyListeners =
  (): void => {
    if (
      debounceTimer !==
      undefined
    ) {
      window.clearTimeout(
        debounceTimer,
      );
    }

    debounceTimer =
      window.setTimeout(
        () => {
          for (
            const listener of
              listeners
          ) {
            try {
              listener();
            } catch (
              error
            ) {
              console.error(
                "Dynamic page listener failed:",
                error,
              );
            }
          }
        },
        150,
      );
  };

export const startDynamicPageObserver =
  (): void => {
    if (observer) {
      return;
    }

    const root =
      document.documentElement;

    if (!root) {
      return;
    }

    observer =
      new MutationObserver(
        notifyListeners,
      );

    observer.observe(
      root,
      {
        childList: true,
        subtree: true,
        attributes: true,
      },
    );

    console.log(
      "Workday dynamic page observer started.",
    );
  };

export const stopDynamicPageObserver =
  (): void => {
    observer?.disconnect();

    observer =
      undefined;

    listeners.clear();

    if (
      debounceTimer !==
      undefined
    ) {
      window.clearTimeout(
        debounceTimer,
      );

      debounceTimer =
        undefined;
    }
  };

export const subscribeToDynamicPage =
  (
    listener:
      DynamicPageListener,
  ): (() => void) => {
    listeners.add(
      listener,
    );

    return () => {
      listeners.delete(
        listener,
      );
    };
  };