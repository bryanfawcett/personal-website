"use client"

import Image from "next/image"
import { useState, type ReactNode } from "react"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"
import { ButtonGroup } from "./ui/button-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface SocialLink {
  name: string
  href: string
  icon: ReactNode
}

interface SectionChip {
  label: string
  href?: string
}

interface HeroProps {
  name?: string
  tagline?: string
  subtitle?: string
  description?: ReactNode
  imageSrc?: string
  imageAlt?: string
  socialLinks?: SocialLink[]
  sectionChips?: SectionChip[]
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

// Default social icons (matching Linktree)
const defaultSocialLinks: SocialLink[] = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/bryanfawcett",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  },
  {
    name: "GitHub",
    href: "https://github.com/bryanfawcett",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    name: "Instagram",
    href: "https://instagram.com/bryanfawcett",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@bryanfawcett",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    )
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/yourphonenumber",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    )
  }
]

// Default section chips - matching page section IDs
const defaultSectionChips: SectionChip[] = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Expertise", href: "#expertise" },
  { label: "Projects", href: "#projects" },
  { label: "Connect", href: "#connect" }
]

export function Hero({
  name = "Bryan Fawcett",
  tagline = "DIGITAL CRAFTSMAN / 2025",
  subtitle = "I craft dynamic ecosystems that unite and empower communities.",
  description,
  imageSrc = "/profile.png",
  imageAlt = "Bryan Fawcett",
  socialLinks = defaultSocialLinks,
  sectionChips = defaultSectionChips,
  primaryRole,
  passionProject,
  status
}: HeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <TooltipProvider>
      <div className="relative w-full">
        {/* Full-screen hero image container */}
        <div className="relative h-[100dvh] min-h-[500px] w-full">
          {/* Background image */}
          <div className="absolute inset-0 w-full h-full">
            {/* Loading skeleton */}
            {!imageLoaded && !imageError && (
              <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
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
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background via-background/95 to-transparent" />
          </div>

          {/* Name and social icons - in the gradient fade area at bottom */}
          <div className="absolute bottom-4 left-0 right-0 z-10 px-4 sm:px-8 lg:px-16 text-center pb-safe">
            {/* Name - cursive, centered */}
            <h1 className="font-cursive text-4xl sm:text-6xl lg:text-7xl tracking-tight text-foreground drop-shadow-lg">
              {name}
            </h1>

            {/* Tagline as Badge */}
            <div className="mt-2">
              <Badge variant="secondary" className="font-mono tracking-wider">
                {tagline}
              </Badge>
            </div>

            {/* Subtitle */}
            <h2 className="mt-2 sm:mt-3 text-base sm:text-lg lg:text-xl font-light tracking-tight text-balance text-foreground/90 max-w-md mx-auto">
              {subtitle}
            </h2>

            {/* Social Icons with Tooltips */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="mt-4 flex justify-center items-center gap-5">
                {socialLinks.map((link) => (
                  <Tooltip key={link.name}>
                    <TooltipTrigger asChild>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground/80 hover:text-foreground hover:scale-110 transition-all duration-200"
                        aria-label={link.name}
                      >
                        {link.icon}
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{link.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Section Navigation - ButtonGroup style */}
        {sectionChips && sectionChips.length > 0 && (
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="flex justify-center py-3 px-4 overflow-x-auto scrollbar-hide">
              <ButtonGroup>
                {sectionChips.map((chip) => (
                  <Button
                    key={chip.label}
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={chip.href || `#${chip.label.toLowerCase()}`}>
                      {chip.label}
                    </a>
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </div>
        )}

        {/* Content below hero - flows into background */}
        <div className="relative z-10 px-6 sm:px-8 lg:px-16 max-w-4xl mx-auto pt-8 sm:pt-12">
          {/* Description */}
          {description && (
            <div className="space-y-6 max-w-2xl">
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                {description}
              </p>

              {/* Status indicator with Badge */}
              {status && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Badge variant="outline" className="w-fit">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                    {status.text}
                  </Badge>
                  {status.secondary && (
                    <Badge variant="secondary">{status.secondary}</Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Role cards using Card component */}
          {(primaryRole || passionProject) && (
            <div className="mt-8 sm:mt-12 grid sm:grid-cols-2 gap-4 max-w-2xl">
              {primaryRole && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="font-mono tracking-wider text-xs">
                      PRIMARY ROLE
                    </CardDescription>
                    <CardTitle className="text-base">{primaryRole.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {primaryRole.subtitle}
                    </p>
                  </CardContent>
                </Card>
              )}

              {passionProject && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="font-mono tracking-wider text-xs">
                      PASSION PROJECT
                    </CardDescription>
                    <CardTitle className="text-base">{passionProject.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {passionProject.subtitle}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

export default Hero
