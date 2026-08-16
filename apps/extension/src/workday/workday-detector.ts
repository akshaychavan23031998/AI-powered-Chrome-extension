const WORKDAY_HOSTS = [
  "myworkdayjobs.com",
  "workday.com",
];

export const isWorkdayHost = (
  hostname:
    string = window.location.hostname,
): boolean => {
  const normalized =
    hostname.toLowerCase();

  return WORKDAY_HOSTS.some(
    (host) =>
      normalized === host ||
      normalized.endsWith(
        `.${host}`,
      ),
  );
};

export const isWorkdayPage =
  (): boolean => {
    if (
      !isWorkdayHost()
    ) {
      return false;
    }

    return true;
  };