"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

interface StickyNavProps {
  showSectionLinks?: boolean
}

const sectionLinks = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Expertise", href: "#expertise" },
  { label: "Projects", href: "#projects" },
  { label: "Connect", href: "#connect" }
]

const pageLinks = [
  { label: "Profile", href: "/" },
  { label: "Experience", href: "/experience" },
  { label: "Book a Call", href: "/book" }
]

export function StickyNav({ showSectionLinks = true }: StickyNavProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky nav after scrolling past the hero (100vh)
      const heroHeight = window.innerHeight
      setIsVisible(window.scrollY > heroHeight - 60)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Don't render until we've scrolled past the hero
  if (!isVisible) return null

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <nav
        className="flex justify-center items-center gap-4 py-3 px-4 overflow-x-auto scrollbar-hide"
        aria-label="Main navigation"
      >
        {/* Global page navigation */}
        <ButtonGroup>
          {pageLinks.map((item) => (
            <Button
              key={item.label}
              variant="outline"
              size="touch"
              className="text-sm"
              asChild
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </ButtonGroup>

        {/* Section links for homepage */}
        {showSectionLinks && (
          <>
            <span className="text-border">|</span>
            <ButtonGroup>
              {sectionLinks.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="touch"
                  className="text-sm"
                  asChild
                >
                  <a href={item.href}>{item.label}</a>
                </Button>
              ))}
            </ButtonGroup>
          </>
        )}
      </nav>
    </header>
  )
}

export default StickyNav
