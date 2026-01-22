import { cn } from "@/lib/utils"
import { Skeleton as BaseSkeleton } from "./ui/skeleton"

// Re-export the base Skeleton component
export { BaseSkeleton as Skeleton }

// SkeletonText - renders multiple lines of skeleton text
interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {[...Array(lines)].map((_, i) => (
        <BaseSkeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  )
}

// SkeletonCard - renders a card-shaped skeleton
interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("p-6 border border-border rounded-lg space-y-4", className)}>
      <BaseSkeleton className="h-6 w-1/2" />
      <div className="space-y-2">
        <BaseSkeleton className="h-4 w-full" />
        <BaseSkeleton className="h-4 w-full" />
        <BaseSkeleton className="h-4 w-3/4" />
      </div>
      <div className="flex gap-2">
        <BaseSkeleton className="h-6 w-16 rounded" />
        <BaseSkeleton className="h-6 w-16 rounded" />
      </div>
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div
      className="relative h-[100dvh] min-h-[500px] w-full"
      role="status"
      aria-label="Loading content"
    >
      {/* Background skeleton */}
      <BaseSkeleton className="absolute inset-0 w-full h-full rounded-none" />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background via-background/95 to-transparent" />

      {/* Content skeletons */}
      <div className="absolute bottom-4 left-0 right-0 z-10 px-4 sm:px-8 lg:px-16 text-center pb-safe">
        {/* Name skeleton */}
        <BaseSkeleton className="h-12 sm:h-16 lg:h-20 w-64 sm:w-80 mx-auto" />

        {/* Tagline skeleton */}
        <BaseSkeleton className="h-6 w-48 mx-auto mt-2" />

        {/* Subtitle skeleton */}
        <BaseSkeleton className="h-6 w-72 max-w-md mx-auto mt-2 sm:mt-3" />

        {/* Social icons skeleton */}
        <div className="mt-4 flex justify-center items-center gap-5">
          {[...Array(5)].map((_, i) => (
            <BaseSkeleton key={i} className="w-7 h-7 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonSection() {
  return (
    <div className="space-y-12 sm:space-y-16 w-full">
      {/* Section title */}
      <BaseSkeleton className="h-10 w-64" />

      {/* Content grid */}
      <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
        <div className="space-y-6">
          <div className="space-y-3">
            <BaseSkeleton className="h-6 w-40" />
            <BaseSkeleton className="h-20 w-full" />
          </div>
          <div className="space-y-3">
            <BaseSkeleton className="h-6 w-32" />
            <BaseSkeleton className="h-20 w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <BaseSkeleton className="h-6 w-36" />
            <BaseSkeleton className="h-20 w-full" />
          </div>
          <div className="space-y-3">
            <BaseSkeleton className="h-6 w-44" />
            <BaseSkeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonProjectGrid() {
  return (
    <div className="space-y-8">
      {/* Project category */}
      <div className="space-y-4">
        <BaseSkeleton className="h-5 w-48" />
        <BaseSkeleton className="h-4 w-96 max-w-full" />

        {/* Project cards grid */}
        <div className="grid gap-4 lg:grid-cols-2 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-6 border border-border rounded-lg">
              <div className="space-y-2">
                <BaseSkeleton className="h-5 w-32" />
                <BaseSkeleton className="h-4 w-full" />
                <BaseSkeleton className="h-3 w-24 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
