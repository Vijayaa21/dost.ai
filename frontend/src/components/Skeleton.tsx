import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height || (variant === 'text' ? '1em' : undefined),
  };

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
}

// Pre-built skeleton layouts for common use cases
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('bg-white rounded-2xl p-6 shadow-sm border border-gray-100', className)}>
      <Skeleton variant="text" className="h-6 w-1/3 mb-4" />
      <Skeleton variant="text" className="h-4 w-full mb-2" />
      <Skeleton variant="text" className="h-4 w-2/3 mb-4" />
      <Skeleton variant="rounded" className="h-32 w-full" />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Assistant message */}
      <div className="flex gap-3">
        <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="rounded" className="h-16 w-3/4" />
        </div>
      </div>
      {/* User message */}
      <div className="flex gap-3 justify-end">
        <div className="flex-1 space-y-2 flex flex-col items-end">
          <Skeleton variant="rounded" className="h-12 w-1/2 bg-indigo-100" />
        </div>
      </div>
      {/* Assistant message */}
      <div className="flex gap-3">
        <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="rounded" className="h-24 w-4/5" />
        </div>
      </div>
    </div>
  );
}

export function MoodCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton variant="text" className="h-5 w-24 mb-2" />
          <Skeleton variant="text" className="h-4 w-32" />
        </div>
      </div>
      <Skeleton variant="text" className="h-4 w-full mb-2" />
      <Skeleton variant="text" className="h-4 w-3/4" />
    </div>
  );
}

export function JournalSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Skeleton variant="text" className="h-6 w-40 mb-2" />
          <Skeleton variant="text" className="h-4 w-24" />
        </div>
        <Skeleton variant="rounded" className="h-8 w-20" />
      </div>
      <Skeleton variant="text" className="h-4 w-full mb-2" />
      <Skeleton variant="text" className="h-4 w-full mb-2" />
      <Skeleton variant="text" className="h-4 w-2/3" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton variant="text" className="h-8 w-48 mb-2" />
            <Skeleton variant="text" className="h-5 w-64" />
          </div>
          <Skeleton variant="rounded" className="h-10 w-32" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <Skeleton variant="circular" className="w-12 h-12 mb-4" />
              <Skeleton variant="text" className="h-8 w-16 mb-2" />
              <Skeleton variant="text" className="h-4 w-24" />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function PetSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Pet Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <Skeleton variant="circular" className="w-32 h-32 mx-auto mb-4" />
          <Skeleton variant="text" className="h-8 w-40 mx-auto mb-2" />
          <Skeleton variant="text" className="h-5 w-24 mx-auto mb-6" />
          
          {/* Stats */}
          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <Skeleton variant="text" className="h-4 w-20 mb-2" />
              <Skeleton variant="rounded" className="h-3 w-full" />
            </div>
            <div>
              <Skeleton variant="text" className="h-4 w-20 mb-2" />
              <Skeleton variant="rounded" className="h-3 w-full" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Skeleton variant="text" className="h-8 w-48 mb-2" />
          <Skeleton variant="text" className="h-5 w-72" />
        </div>

        {/* Pattern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton variant="circular" className="w-10 h-10" />
                <Skeleton variant="text" className="h-5 w-32" />
              </div>
              <Skeleton variant="text" className="h-4 w-full mb-2" />
              <Skeleton variant="text" className="h-4 w-3/4 mb-4" />
              <Skeleton variant="rounded" className="h-2 w-full" />
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Skeleton variant="text" className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <Skeleton variant="circular" className="w-8 h-8" />
                <div className="flex-1">
                  <Skeleton variant="text" className="h-5 w-48 mb-1" />
                  <Skeleton variant="text" className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
