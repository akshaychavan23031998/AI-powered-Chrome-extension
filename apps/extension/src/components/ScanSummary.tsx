import type {
  WorkdayScanResult,
} from "../types/dom-field";

interface ScanSummaryProps {
  result: WorkdayScanResult;
}

export const ScanSummary = ({
  result,
}: ScanSummaryProps) => {
  const visibleFields =
    result.fields.filter(
      (field) =>
        field.visible,
    );

  const requiredFields =
    result.fields.filter(
      (field) =>
        field.required,
    );

  const filledFields =
    result.fields.filter(
      (field) =>
        field.hasValue,
    );

  return (
    <section className="scan-summary">
      <div className="scan-summary-header">
        <div>
          <p className="status-label">
            DOM Scan
          </p>

          <p className="scan-title">
            {result.fieldCount} fields found
          </p>
        </div>
      </div>

      <div className="scan-stats">
        <div>
          <strong>
            {visibleFields.length}
          </strong>

          <span>Visible</span>
        </div>

        <div>
          <strong>
            {requiredFields.length}
          </strong>

          <span>Required</span>
        </div>

        <div>
          <strong>
            {filledFields.length}
          </strong>

          <span>Filled</span>
        </div>
      </div>
    </section>
  );
};