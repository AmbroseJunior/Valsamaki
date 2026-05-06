export default function EventsLoading() {
  return (
    <div className="max-w-[var(--max-content-width)] mx-auto px-4 py-6 space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-[var(--color-muted)] rounded-[var(--radius)]" />
      <div className="h-5 w-72 bg-[var(--color-muted)] rounded-[var(--radius)]" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 bg-[var(--color-muted)] rounded-[var(--radius-2xl)]" />
      ))}
    </div>
  )
}
