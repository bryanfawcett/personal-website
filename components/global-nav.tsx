"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

interface GlobalNavProps {
  showName?: boolean
  className?: string
}

const navItems = [
  { label: "Profile", href: "/" },
  { label: "Experience", href: "/experience" },
  { label: "Book a Call", href: "/book" }
]

export function GlobalNav({ showName = true, className = "" }: GlobalNavProps) {
  const pathname = usePathname()

  return (
    <header className={`sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 ${className}`}>
      <nav
        className="max-w-4xl mx-auto px-6 sm:px-8 py-3 flex items-center justify-between gap-4"
        aria-label="Main navigation"
      >
        {showName && (
          <Link
            href="/"
            className="text-lg font-medium hover:text-muted-foreground transition-colors min-h-[44px] flex items-center"
          >
            Bryan Fawcett
          </Link>
        )}

        <ButtonGroup>
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={pathname === item.href ? "default" : "outline"}
              size="touch"
              className="text-sm"
              asChild
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </ButtonGroup>
      </nav>
    </header>
  )
}

export default GlobalNav
