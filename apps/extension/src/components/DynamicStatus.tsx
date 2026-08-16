import type {
  DynamicSectionScanResult,
} from "../types/repeatable";

interface DynamicStatusProps {
  result:
    DynamicSectionScanResult;
}

export const DynamicStatus = ({
  result,
}: DynamicStatusProps) => {
  return (
    <section className="dynamic-summary">
      <p className="status-label">
        Dynamic Sections
      </p>

      <p className="scan-title">
        {result.sectionCount} repeatable
        sections detected
      </p>

      {result.sections.length >
      0 ? (
        <div className="dynamic-list">
          {result.sections.map(
            (section) => (
              <div
                className="dynamic-row"
                key={section.kind}
              >
                <div>
                  <strong>
                    {section.title}
                  </strong>

                  <span>
                    {
                      section.entryCount
                    }{" "}
                    entr
                    {section.entryCount ===
                    1
                      ? "y"
                      : "ies"}
                  </span>
                </div>

                <span>
                  {section.canAddAnother
                    ? "Add available"
                    : "No add button"}
                </span>
              </div>
            ),
          )}
        </div>
      ) : (
        <p className="mapping-empty">
          No repeatable Workday
          sections detected on this
          page.
        </p>
      )}
    </section>
  );
};