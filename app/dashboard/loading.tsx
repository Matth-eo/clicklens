export default function Loading() {
  return (
    <div className="loading-state" role="status" aria-label="Loading workspace">
      <div className="skeleton skeleton-heading" />
      <div className="stats-grid">
        {[1, 2, 3].map((n) => (
          <div className="skeleton skeleton-stat" key={n} />
        ))}
      </div>
      <div className="skeleton skeleton-chart" />
      <span className="sr-only">Loading your links…</span>
    </div>
  );
}
