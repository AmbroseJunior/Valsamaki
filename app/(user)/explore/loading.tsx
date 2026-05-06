export default function ExploreLoading() {
  return (
    <div className="max-w-[var(--max-content-width)] mx-auto px-4 py-6 animate-pulse">
      <div className="h-8 w-48 bg-[var(--color-muted)] rounded-[var(--radius)] mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] bg-[var(--color-muted)] rounded-[var(--radius-xl)]" />
        ))}
      </div>
    </div>
  )
}
