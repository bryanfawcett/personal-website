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
  tagline = "TECHNOLOGY LEADER & DIGITAL CRAFTSMAN / 2025",
  subtitle = "Building Systems That Transform Communities",
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
    <div className="space-y-8 sm:space-y-12 w-full">
      {/* Hero Image with fade effect */}
      <div className="relative flex justify-center mb-8">
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72">
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0 rounded-full" />
          )}

          {/* Actual image */}
          {!imageError && (
            <div className="relative w-full h-full rounded-full overflow-hidden hero-image-fade">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority
                className={`object-cover object-center transition-opacity duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                sizes="(max-width: 640px) 192px, (max-width: 1024px) 256px, 288px"
              />
            </div>
          )}

          {/* Fallback placeholder */}
          {imageError && (
            <div className="absolute inset-0 rounded-full bg-muted flex items-center justify-center">
              <span className="font-cursive text-4xl text-muted-foreground">
                {name.split(" ").map(n => n[0]).join("")}
              </span>
            </div>
          )}

          {/* Bottom gradient fade to blend into background */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent rounded-b-full" />
        </div>
      </div>

      {/* Name and tagline */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-light tracking-tight text-balance">
          {name}
        </h1>
        <div className="text-sm text-muted-foreground font-mono tracking-wider">
          {tagline}
        </div>
      </div>

      {/* Subtitle */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-light tracking-tight text-balance text-muted-foreground">
          {subtitle}
        </h2>
      </div>

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
        <div className="grid sm:grid-cols-2 gap-8 pt-4">
          {primaryRole && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground font-mono">PRIMARY ROLE</div>
              <div className="space-y-2">
                <div className="text-foreground font-medium">{primaryRole.title}</div>
                <div className="text-muted-foreground text-sm leading-relaxed">
                  {primaryRole.subtitle}
                </div>
              </div>
            </div>
          )}

          {passionProject && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground font-mono">PASSION PROJECT</div>
              <div className="space-y-2">
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
  )
}

export default Hero
