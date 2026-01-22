import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted rounded-md animate-skeleton",
        className
      )}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ className, lines = 3 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "p-6 border border-border rounded-lg space-y-4",
        className
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-6 w-1/2" />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  )
}

export function SkeletonHero({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center",
        className
      )}
      aria-label="Loading content"
      role="status"
    >
      <div className="space-y-8 w-full max-w-4xl mx-auto px-6">
        {/* Profile image skeleton */}
        <div className="flex justify-center mb-8">
          <Skeleton className="w-48 h-48 sm:w-64 sm:h-64 rounded-full" />
        </div>

        {/* Name skeleton */}
        <Skeleton className="h-16 sm:h-20 w-3/4 mx-auto" />

        {/* Tagline skeleton */}
        <Skeleton className="h-4 w-1/2 mx-auto" />

        {/* Description skeleton */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <Skeleton className="h-8 sm:h-10 w-full" />
          <Skeleton className="h-8 sm:h-10 w-5/6" />
        </div>

        {/* Paragraph skeleton */}
        <SkeletonText lines={4} className="max-w-2xl mx-auto" />

        {/* Info cards skeleton */}
        <div className="grid sm:grid-cols-2 gap-8 pt-4">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonSection({ className }: SkeletonProps) {
  return (
    <div
      className={cn("py-20 sm:py-32 space-y-12", className)}
      aria-hidden="true"
    >
      <Skeleton className="h-10 w-64" />
      <div className="grid lg:grid-cols-2 gap-8">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

export function SkeletonProjectGrid({ className }: SkeletonProps) {
  return (
    <div
      className={cn("grid gap-4 lg:grid-cols-2", className)}
      aria-hidden="true"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
