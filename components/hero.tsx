"use client"

import Image from "next/image"
import { useState, type ReactNode } from "react"
import { Skeleton } from "./skeleton"

interface HeroProps {
  name?: string
  tagline?: string
  subtitle?: string
  description?: ReactNode
  imageSrc?: string
  imageAlt?: string
  primaryRole?: {
    title: string
    subtitle: string
  }
  passionProject?: {
    title: string
    subtitle: string
  }
  status?: {
    text: string
    secondary?: string
  }
}

export function Hero({
  name = "Bryan Fawcett",
  tagline = "DIGITAL CRAFTSMAN / 2025",
  subtitle = "I craft dynamic ecosystems that unite and empower communities.",
  description,
  imageSrc = "/profile.jpg",
  imageAlt = "Bryan Fawcett",
  primaryRole,
  passionProject,
  status
}: HeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      {/* Full-screen hero image */}
      <div className="absolute inset-0 w-full h-full">
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}

        {/* Actual image */}
        {!imageError && (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            className={`object-cover object-top transition-opacity duration-700 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            sizes="100vw"
          />
        )}

        {/* Fallback gradient background */}
        {imageError && (
          <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        )}

        {/* Bottom fade gradient - blends image into background */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent" />

        {/* Overall darkening overlay for text readability */}
        <div className="absolute inset-0 bg-background/30" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-16 sm:pb-24 lg:pb-32 px-6 sm:px-8 lg:px-16">
        {/* Name - animated cursive */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="font-cursive text-5xl sm:text-7xl lg:text-9xl tracking-tight text-foreground drop-shadow-lg">
            {name}
          </h1>

          {/* Tagline */}
          <div className="text-sm text-muted-foreground font-mono tracking-wider">
            {tagline}
          </div>
        </div>

        {/* Subtitle */}
        <div className="mt-6 sm:mt-8 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-balance text-foreground/90">
            {subtitle}
          </h2>
        </div>

        {/* Description */}
        {description && (
          <div className="mt-6 sm:mt-8 space-y-6 max-w-2xl">
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {description}
            </p>

            {/* Status indicator */}
            {status && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {status.text}
                </div>
                {status.secondary && <div>{status.secondary}</div>}
              </div>
            )}
          </div>
        )}

        {/* Role cards */}
        {(primaryRole || passionProject) && (
          <div className="mt-8 sm:mt-12 grid sm:grid-cols-2 gap-8 max-w-2xl">
            {primaryRole && (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground font-mono tracking-wider">PRIMARY ROLE</div>
                <div className="space-y-1">
                  <div className="text-foreground font-medium">{primaryRole.title}</div>
                  <div className="text-muted-foreground text-sm leading-relaxed">
                    {primaryRole.subtitle}
                  </div>
                </div>
              </div>
            )}

            {passionProject && (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground font-mono tracking-wider">PASSION PROJECT</div>
                <div className="space-y-1">
                  <div className="text-foreground font-medium">{passionProject.title}</div>
                  <div className="text-muted-foreground text-sm leading-relaxed">
                    {passionProject.subtitle}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Hero
