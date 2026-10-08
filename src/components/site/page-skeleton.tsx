/** Скелетон внутренней страницы — показывается мгновенно при переходе, пока грузятся данные. */
export function PageSkeleton() {
  return (
    <div className="container-page animate-pulse pt-6 pb-16 sm:pt-10" aria-busy="true">
      <div className="h-4 w-48 rounded bg-muted" />
      <div className="mt-8 h-12 w-3/4 max-w-2xl rounded-2xl bg-muted" />
      <div className="mt-5 h-5 w-1/2 max-w-xl rounded bg-muted" />
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-3">
          <div className="h-4 rounded bg-muted" />
          <div className="h-4 w-11/12 rounded bg-muted" />
          <div className="h-4 w-4/5 rounded bg-muted" />
        </div>
        <div className="h-56 rounded-3xl bg-muted" />
      </div>
    </div>
  );
}
