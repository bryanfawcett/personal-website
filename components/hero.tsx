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
    <div className="relative w-full">
      {/* Full-screen hero image container */}
      <div className="relative h-screen w-full">
        {/* Background image */}
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
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-background via-background/90 to-transparent" />
        </div>

        {/* Name and subtitle positioned in the fade area - centered like iOS contact card */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 sm:px-8 lg:px-16 pb-8 sm:pb-12 text-center">
          {/* Name - cursive, centered */}
          <h1 className="font-cursive text-5xl sm:text-7xl lg:text-8xl tracking-tight text-foreground drop-shadow-lg">
            {name}
          </h1>

          {/* Tagline */}
          <div className="mt-2 text-sm text-muted-foreground font-mono tracking-wider">
            {tagline}
          </div>

          {/* Subtitle */}
          <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl lg:text-3xl font-light tracking-tight text-balance text-foreground/90 max-w-2xl mx-auto">
            {subtitle}
          </h2>
        </div>
      </div>

      {/* Content below hero - flows into background */}
      <div className="relative z-10 px-6 sm:px-8 lg:px-16 max-w-4xl mx-auto pt-8 sm:pt-12">
        {/* Description */}
        {description && (
          <div className="space-y-6 max-w-2xl">
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
