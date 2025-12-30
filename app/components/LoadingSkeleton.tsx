'use client';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-2 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-1/2 mb-1" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="mt-2 h-3 bg-gray-100 rounded w-16" />
    </div>
  );
}

function SkeletonColumn() {
  return (
    <div className="flex flex-col w-72 shrink-0 bg-gray-50 rounded-lg border border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-6 animate-pulse" />
        </div>
      </div>
      <div className="flex-1 p-2 min-h-[200px]">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-48 animate-pulse" />
          </div>
          <div className="h-10 bg-blue-200 rounded-lg w-28 animate-pulse" />
        </div>
      </header>
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonColumn key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}
