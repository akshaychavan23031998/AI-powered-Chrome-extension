import {
  scanDomFields,
} from "../scanner/dom-scanner";

import type {
  WorkdayScanResult,
} from "../types/dom-field";

import {
  isWorkdayPage,
} from "./workday-detector";

export const scanWorkdayPage =
  (): WorkdayScanResult => {
    const detected =
      isWorkdayPage();

    const fields =
      detected
        ? scanDomFields()
        : [];

    return {
      url:
        window.location.href,

      title:
        document.title,

      detected,

      scannedAt:
        new Date().toISOString(),

      fieldCount:
        fields.length,

      fields,
    };
  };