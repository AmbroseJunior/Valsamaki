export default function DashboardLoading() {
  return (
    <div className="max-w-[var(--max-content-width)] mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-[var(--color-muted)] rounded-[var(--radius)]" />
      <div className="h-24 bg-[var(--color-muted)] rounded-[var(--radius-2xl)]" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] bg-[var(--color-muted)] rounded-[var(--radius-xl)]" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 bg-[var(--color-muted)] rounded-[var(--radius-2xl)]" />
        <div className="h-64 bg-[var(--color-muted)] rounded-[var(--radius-2xl)]" />
      </div>
    </div>
  )
}
