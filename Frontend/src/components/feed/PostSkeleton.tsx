export function PostSkeleton() {
  return (
    <div className="surface-card mb-4 p-4" aria-hidden>
      <div className="flex items-center gap-3">
        <div className="shimmer size-11 rounded-full bg-muted" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="shimmer h-3.5 w-36 rounded-full bg-muted" />
          <div className="shimmer h-3 w-24 rounded-full bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="shimmer h-3.5 w-full rounded-full bg-muted" />
        <div className="shimmer h-3.5 w-3/5 rounded-full bg-muted" />
      </div>
      <div className="shimmer mt-4 aspect-4/3 w-full rounded-2xl bg-muted" />
      <div className="mt-4 flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="shimmer h-8 w-20 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
