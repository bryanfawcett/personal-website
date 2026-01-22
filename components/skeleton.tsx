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
        "relative w-full min-h-screen flex flex-col",
        className
      )}
      aria-label="Loading content"
      role="status"
    >
      {/* Full-screen background skeleton */}
      <Skeleton className="absolute inset-0 w-full h-full" />

      {/* Bottom fade gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent" />

      {/* Content skeleton overlay */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-16 sm:pb-24 lg:pb-32 px-6 sm:px-8 lg:px-16">
        {/* Name skeleton */}
        <Skeleton className="h-16 sm:h-24 lg:h-32 w-3/4 max-w-lg" />

        {/* Tagline skeleton */}
        <Skeleton className="h-4 w-48 mt-4" />

        {/* Subtitle skeleton */}
        <Skeleton className="h-8 sm:h-10 lg:h-12 w-full max-w-2xl mt-6" />

        {/* Description skeleton */}
        <div className="mt-6 space-y-3 max-w-2xl">
          <SkeletonText lines={3} />
        </div>

        {/* Info cards skeleton */}
        <div className="mt-8 grid sm:grid-cols-2 gap-8 max-w-2xl">
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
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
