"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

interface NavItem {
  label: string
  href: string
}

interface StickyNavProps {
  items?: NavItem[]
}

const defaultItems: NavItem[] = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Expertise", href: "#expertise" },
  { label: "Projects", href: "#projects" },
  { label: "Connect", href: "#connect" }
]

export function StickyNav({ items = defaultItems }: StickyNavProps) {
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
        className="flex justify-center py-3 px-4 overflow-x-auto scrollbar-hide"
        aria-label="Main navigation"
      >
        <ButtonGroup>
          {items.map((item) => (
            <Button
              key={item.label}
              variant="outline"
              size="sm"
              asChild
            >
              <a href={item.href}>{item.label}</a>
            </Button>
          ))}
        </ButtonGroup>
      </nav>
    </header>
  )
}

export default StickyNav
