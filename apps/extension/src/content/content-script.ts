const WORKDAY_HOST_PATTERNS = [
  "myworkdayjobs.com",
  "workday.com",
];

const detectWorkdayPage =
  (): boolean => {
    const hostname =
      window.location.hostname
        .toLowerCase();

    return WORKDAY_HOST_PATTERNS.some(
      (pattern) =>
        hostname.endsWith(
          pattern,
        ),
    );
  };

const notifyWorkdayDetection =
  async (): Promise<void> => {
    const detected =
      detectWorkdayPage();

    try {
      await chrome.runtime.sendMessage({
        type: "WORKDAY_DETECTED",
        detected,
      });
    } catch (error) {
      console.debug(
        "Unable to notify service worker:",
        error,
      );
    }
  };

console.log(
  "Workday AI Assistant content script loaded.",
);

void notifyWorkdayDetection();