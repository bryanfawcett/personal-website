"use client"

import { useEffect, useState } from "react"

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
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Get the hero height (100dvh) and check if we've scrolled past it
      const heroHeight = window.innerHeight
      setIsSticky(window.scrollY > heroHeight - 60)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={`${
        isSticky ? "fixed top-0" : "absolute bottom-0"
      } left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 transition-all duration-300`}
    >
      <div className="flex justify-center py-3 px-4 overflow-x-auto scrollbar-hide">
        <div className="inline-flex rounded-lg border border-border bg-background shadow-sm">
          {items.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                index === 0 ? "rounded-l-lg" : ""
              } ${
                index === items.length - 1 ? "rounded-r-lg" : "border-r border-border"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StickyNav
