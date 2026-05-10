"use client";
export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className="skeleton aspect-[2/3] rounded-[var(--radius)] w-full" />
      <div className="skeleton h-3 rounded w-3/4" />
      <div className="skeleton h-3 rounded w-1/2" />
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      <div className="skeleton h-64 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-6 rounded w-2/3" />
        <div className="skeleton h-4 rounded w-1/2" />
        <div className="skeleton h-4 rounded w-full" />
        <div className="skeleton h-4 rounded w-full" />
        <div className="skeleton h-4 rounded w-3/4" />
      </div>
    </div>
  );
}
