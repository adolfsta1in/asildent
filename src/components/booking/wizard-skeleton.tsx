export function WizardSkeleton() {
  return (
    <div className="grid grid-cols-1 animate-pulse gap-8 lg:grid-cols-[1fr_22rem]" aria-busy="true">
      <div>
        <div className="h-2 rounded-full bg-muted" />
        <div className="mt-8 h-8 w-64 rounded-xl bg-muted" />
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-24 rounded-3xl bg-muted" />
          ))}
        </div>
      </div>
      <div className="hidden h-72 rounded-3xl bg-muted lg:block" />
    </div>
  );
}
