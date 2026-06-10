import { cn } from '../../lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return <div className={cn('loading-spinner', className)} />;
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner className="w-12 h-12 mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="glass-card p-4">
      <div className="skeleton w-full aspect-square mb-4 rounded-xl" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  );
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => <LoadingCard key={i} />)}
    </div>
  );
}
