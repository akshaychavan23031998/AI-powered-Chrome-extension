import type {
  AutofillResult,
} from "../types/fill";

interface FillSummaryProps {
  result:
    AutofillResult;
}

export const FillSummary = ({
  result,
}: FillSummaryProps) => {
  return (
    <section className="fill-summary">
      <p className="status-label">
        Autofill Result
      </p>

      <p className="scan-title">
        {result.filledCount} fields filled
      </p>

      <div className="scan-stats">
        <div>
          <strong>
            {result.filledCount}
          </strong>

          <span>
            Filled
          </span>
        </div>

        <div>
          <strong>
            {result.skippedCount}
          </strong>

          <span>
            Skipped
          </span>
        </div>

        <div>
          <strong>
            {result.failedCount}
          </strong>

          <span>
            Failed
          </span>
        </div>
      </div>

      {result.results.length >
      0 ? (
        <div className="fill-list">
          {result.results.map(
            (item) => (
              <div
                className="fill-row"
                key={
                  item.fieldId
                }
              >
                <span>
                  {item.label ||
                    item.fieldId}
                </span>

                <strong
                  className={`fill-status fill-status-${item.status}`}
                >
                  {item.status}
                </strong>
              </div>
            ),
          )}
        </div>
      ) : (
        <p className="mapping-empty">
          No safe high-confidence
          fields were available
          for autofill.
        </p>
      )}
    </section>
  );
};