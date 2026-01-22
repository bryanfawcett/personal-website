# CLAUDE.md - AI Assistant Guide

This document provides essential context for AI assistants working on this Next.js portfolio website.

## About Bryan Fawcett

**Current Role:** Associate Technology & Innovation Coordinator at Singapore American School (SAS)
- Focuses on integrating technology within educational practices and operational efficiencies
- Previous SAS roles: Privacy & Governance Manager, IT Infrastructure Manager, Application System Engineer

**Background:**
- 10+ years in EdTech across Africa and Asia
- Previously Technology Coordinator at Osaka YMCA International School
- Teaching and administrative roles across schools in Zimbabwe
- Expertise: Cybersecurity, process optimization, IT governance, system architecture

**Location:** Singapore | **Email:** bryan@nyuchi.com

### Nyuchi Africa Ecosystem (Passion Project)

Bryan founded Nyuchi Africa, building digital solutions for African communities under the Ubuntu philosophy ("I am because we are").

| Platform | URL | Description |
|----------|-----|-------------|
| **Nyuchi Africa** | nyuchi.com | Community-focused business platform for African entrepreneurship |
| **Nyuchi Learning** | learning.nyuchi.com | Open-source K-12 digital transformation frameworks for African schools |
| **Nyuchi Lingo** | lingo.nyuchi.com | Language learning platform for African languages |
| **Mukoko** | mukoko.com | Privacy-focused social platform with 6 apps (ID, Clips, Pulse, Connect, Novels, Events) |
| **Mukoko News** | news.mukoko.com | Pan-African news aggregation from trusted regional sources |
| **Nhimbe** | nhimbe.com | Community events and gatherings platform (part of Mukoko ecosystem) |
| **Zimbabwe Travel Info** | travel-info.co.zw | Comprehensive travel guide for Zimbabwe |
| **Iconic Expeditions** | iconic-expeditions.com | Luxury bespoke safaris across Southern and Eastern Africa |
| **Workspace Tools** | (internal) | Gmail signature management for Google Workspace |

### GitHub Organizations

- **Personal:** [github.com/bryanfawcett](https://github.com/bryanfawcett)
- **Nyuchitech:** [github.com/nyuchitech](https://github.com/nyuchitech) - 13+ public repos
- **SAS Tech Innovation:** [github.com/SAS-Technology-Innovation](https://github.com/SAS-Technology-Innovation) - 5 public repos

### Social Links (Canonical)

- **LinkedIn:** linkedin.com/in/bryandavidfawcett
- **GitHub:** github.com/bryanfawcett
- **Twitter/X:** @bryanfawcett
- **Website:** bryanfawcett.com

## Quick Reference

```bash
# Development
pnpm dev              # Start dev server at localhost:3000
pnpm build            # Production build
pnpm lint             # ESLint check
pnpm test             # Tests in watch mode
pnpm test:run         # Run tests once
pnpm test:coverage    # Tests with coverage report
```

**Requirements:** Node.js 20+, pnpm 10+

## Project Overview

A personal portfolio website for Bryan Fawcett built with:
- **Next.js 16** with App Router
- **React 19** with TypeScript 5
- **Tailwind CSS 4** for styling
- **Radix UI + shadcn/ui** for components
- **Vitest + React Testing Library** for testing

## Directory Structure

```
app/                    # Next.js App Router (routes, layouts)
  layout.tsx           # Root layout with Google Fonts
  page.tsx             # Main page (client component)
  globals.css          # Global styles, CSS variables, animations

components/            # React components
  __tests__/           # Component tests (*.test.tsx)
  ui/                  # shadcn/ui primitives (button, card, badge, etc.)
  hero.tsx             # Hero section
  loading-screen.tsx   # Animated loading screen
  error-boundary.tsx   # Error handling components
  skeleton.tsx         # Loading state placeholders
  sticky-nav.tsx       # Sticky navigation
  theme-provider.tsx   # Theme context

lib/
  utils.ts             # Utility functions (cn helper)

public/                # Static assets (images)
```

## Code Conventions

### Component Patterns

**1. Client Components** - Add `"use client"` for components with hooks/interactivity:
```tsx
"use client"

interface HeroProps {
  name?: string
  tagline?: string
}

export function Hero({ name = "Default", tagline }: HeroProps) {
  const [state, setState] = useState(false)
  // ...
}
```

**2. shadcn/ui Components** - Use forwardRef, cva for variants, cn for class merging:
```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", secondary: "..." },
    size: { default: "...", sm: "...", lg: "..." }
  },
  defaultVariants: { variant: "default", size: "default" }
})

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
```

**3. Error Boundaries** - Wrap sections for graceful error handling:
```tsx
<SectionErrorBoundary sectionName="Projects">
  <ProjectsSection />
</SectionErrorBoundary>
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `loading-screen.tsx` |
| Components | PascalCase | `LoadingScreen` |
| Props interfaces | PascalCase + Props | `LoadingScreenProps` |
| Functions | camelCase | `handleClick` |
| Constants | UPPER_SNAKE_CASE | `MINIMUM_DISPLAY_TIME` |

### Styling

**Tailwind CSS utilities** - Use utility classes, responsive prefixes (`sm:`, `md:`, `lg:`):
```tsx
<div className="flex flex-col gap-4 p-6 lg:flex-row lg:gap-8">
```

**Class merging** - Always use `cn()` from `@/lib/utils`:
```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", isActive && "active-class", className)} />
```

**CSS Variables** - Theme colors in `globals.css` use OKLCH color space:
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
}
```

**Custom animations** defined in `globals.css`:
- `animate-fade-in-up` - Fade and slide up
- `animate-text-reveal` - Text clip-path reveal
- `animate-skeleton` - Pulse animation
- `animate-loading-fade-out` - Fade out

### Typography

Three font families loaded via Google Fonts in `app/layout.tsx`:
- **font-serif** (Noto Serif) - Headings
- **font-poppins** (Poppins) - Body text
- **font-cursive** (Dancing Script) - Decorative/loading text

## Testing Requirements

**All new components must have tests.** Place tests in `components/__tests__/`.

### Test Structure
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ComponentName } from '../component-name'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const handleClick = vi.fn()
    render(<ComponentName onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Query Priority (prefer semantic queries)
1. `getByRole` - Accessibility role
2. `getByLabelText` - Form labels
3. `getByText` - Text content
4. `getByTestId` - Last resort

### Mocked APIs (in `vitest.setup.ts`)
- `IntersectionObserver`
- `window.matchMedia`
- `ResizeObserver`
- Next.js `Image` component (renders as `<img>`)

## Accessibility Requirements

All components must include:
- **ARIA labels** for interactive elements
- **Semantic HTML** (proper heading hierarchy, nav, section, header, footer)
- **Keyboard navigation** support
- **Role attributes** where needed (status, alert, button)
- **Alt text** for images

```tsx
<button aria-label="Close dialog" onClick={onClose}>
  <XIcon aria-hidden="true" />
</button>

<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

## Common Pitfalls to Avoid

1. **Missing `"use client"`** - Add to files using hooks, event handlers, or browser APIs
2. **Direct class concatenation** - Use `cn()` helper, not template literals
3. **Untested components** - All components need test coverage
4. **Missing TypeScript types** - All props must be typed; avoid `any`
5. **Hardcoded colors** - Use CSS variables (`--foreground`, `--primary`, etc.)
6. **Missing error boundaries** - Wrap feature sections with `SectionErrorBoundary`
7. **Accessibility gaps** - Include ARIA labels and semantic HTML

## Git Workflow

### Commit Prefixes
- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance tasks
- `docs:` - Documentation
- `test:` - Test additions/changes
- `refactor:` - Code refactoring

### CI Pipeline (runs on every push/PR)
1. Lint and type check
2. Run tests
3. Production build
4. Security audit

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout, font loading, metadata |
| `app/page.tsx` | Main portfolio page, state management |
| `app/globals.css` | CSS variables, animations, global styles |
| `components/ui/` | Reusable shadcn/ui primitives |
| `lib/utils.ts` | `cn()` helper for class merging |
| `vitest.config.ts` | Test configuration |
| `vitest.setup.ts` | Test setup, browser API mocks |
| `eslint.config.mjs` | ESLint flat config |
| `components.json` | shadcn/ui configuration |

## Path Aliases

Use `@/` alias for imports (configured in `tsconfig.json`):
```tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Hero } from "@/components/hero"
```

## Adding shadcn/ui Components

The project uses shadcn/ui (new-york style). Components are in `components/ui/`. Existing components include: badge, button, button-group, card, avatar, separator, skeleton, tooltip.

When adding new shadcn components, follow the existing pattern with:
- `forwardRef` for ref forwarding
- `cva` for variants
- `cn()` for class merging
- TypeScript interfaces extending Radix props

## Content Notes

The website content has been updated to reflect accurate information. Key details:

### Projects Listed
The Nyuchi Africa Ecosystem section includes:
- Nyuchi Africa, Nyuchi Learning, Nyuchi Lingo
- Mukoko (social platform), Mukoko News (news aggregation), Nhimbe (events)
- Zimbabwe Travel Info, Iconic Expeditions

### Internal Tools (Not Listed on Website)
- **Workspace Tools** - Gmail signature management for Google Workspace (supports 9 brands)

## Tech Stack Used Across Nyuchi Projects

For context, the broader Nyuchi ecosystem uses:
- **Frontend:** Next.js 15, React, Astro, Tailwind CSS, shadcn/ui
- **Backend:** Hono framework, Cloudflare Workers
- **Database:** Supabase PostgreSQL
- **Storage:** Cloudflare R2
- **AI:** DeepSeek via Cloudflare AI Gateway
- **Payments:** Stripe
- **Deployment:** Vercel (frontend), Cloudflare (workers)
- **Monorepo:** Turbo v2 with npm workspaces
