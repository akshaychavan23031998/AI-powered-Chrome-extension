import type {
  FieldMappingResult,
} from "../types/mapping";

interface MappingSummaryProps {
  result: FieldMappingResult;
}

export const MappingSummary = ({
  result,
}: MappingSummaryProps) => {
  const mappedItems =
    result.mappings.filter(
      (mapping) =>
        Boolean(mapping.targetPath),
    );

  return (
    <section className="mapping-summary">
      <p className="status-label">
        Semantic Mapping
      </p>

      <p className="scan-title">
        {result.mappedCount} fields mapped
      </p>

      <div className="scan-stats">
        <div>
          <strong>
            {result.mappedCount}
          </strong>

          <span>
            Mapped
          </span>
        </div>

        <div>
          <strong>
            {
              result.highConfidenceCount
            }
          </strong>

          <span>
            High confidence
          </span>
        </div>

        <div>
          <strong>
            {result.reviewCount}
          </strong>

          <span>
            Review
          </span>
        </div>
      </div>

      {mappedItems.length > 0 ? (
        <div className="mapping-list">
          {mappedItems
            .slice(0, 6)
            .map((mapping) => (
              <div
                className="mapping-row"
                key={mapping.fieldId}
              >
                <span>
                  {mapping.label ||
                    mapping.fieldId}
                </span>

                <strong>
                  {mapping.targetPath}
                </strong>
              </div>
            ))}
        </div>
      ) : (
        <p className="mapping-empty">
          No safe candidate-backed
          mappings found on this page.
        </p>
      )}
    </section>
  );
};