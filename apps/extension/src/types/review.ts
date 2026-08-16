export interface ReviewSection {
  id: string;
  title: string;
  text: string;
}

export interface WorkdayReviewResult {
  url: string;
  title: string;
  scannedAt: string;

  isReviewStep: boolean;

  applicationSubmitted: boolean;

  sectionCount: number;
  sections: ReviewSection[];

  submitDetected: boolean;

  readyForConfirmation: boolean;

  reason: string;
}

export interface WorkdaySubmitResult {
  submitted: boolean;

  previousUrl: string;
  currentUrl: string;

  message: string;

  reviewStillDetected: boolean;
}