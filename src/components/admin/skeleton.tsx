export function AdminSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true">
      <div className="h-9 w-56 rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-28 rounded-3xl bg-muted" />
        ))}
      </div>
      <div className="h-80 rounded-3xl bg-muted" />
    </div>
  );
}
