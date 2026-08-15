interface StatusCardProps {
  label: string;

  connected: boolean;

  connectedText: string;

  disconnectedText: string;
}

export const StatusCard = ({
  label,
  connected,
  connectedText,
  disconnectedText,
}: StatusCardProps) => {
  return (
    <div className="status-card">
      <div>
        <p className="status-label">
          {label}
        </p>

        <p className="status-value">
          {connected
            ? connectedText
            : disconnectedText}
        </p>
      </div>

      <span
        className={
          connected
            ? "status-dot status-dot-success"
            : "status-dot status-dot-error"
        }
      />
    </div>
  );
};