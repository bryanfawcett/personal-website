# Bryan Fawcett - Personal Portfolio

A modern, accessible portfolio website built with Next.js 16, featuring animated loading screens, comprehensive error handling, and full test coverage.

## Features

- **Animated Loading Screen** - Cursive name reveal animation using Dancing Script font
- **Typography System** - Noto Serif for headings, Poppins for body text
- **Hero Section** - Profile image with fade-to-background effect
- **Skeleton Loading States** - Comprehensive loading UI for all sections
- **Error Boundaries** - Graceful error handling with retry functionality
- **Theme Toggle** - Dark/light mode support
- **Responsive Design** - Mobile-first, works on all devices
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **Full Test Coverage** - 48 tests covering all components

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/bryanfawcett/personal-website.git
cd personal-website

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm test:coverage # Run tests with coverage report
```

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout with font configuration
│   ├── page.tsx        # Main portfolio page
│   └── globals.css     # Global styles and animations
├── components/
│   ├── __tests__/      # Component tests
│   ├── error-boundary.tsx
│   ├── hero.tsx
│   ├── loading-screen.tsx
│   └── skeleton.tsx
├── lib/
│   └── utils.ts        # Utility functions
├── public/
│   └── profile.jpg     # Profile image
├── .github/
│   ├── dependabot.yml  # Automated dependency updates
│   └── workflows/
│       ├── ci.yml      # CI pipeline (lint, test, build)
│       └── claude-review.yml # Claude Code review
└── vitest.config.ts    # Test configuration
```

## Components

### LoadingScreen
Animated loading screen with cursive name reveal.

```tsx
import { LoadingScreen } from '@/components/loading-screen'

<LoadingScreen
  onLoadingComplete={() => setLoading(false)}
  minimumDisplayTime={2500}
/>
```

### Hero
Profile section with image and gradient fade effect.

```tsx
import { Hero } from '@/components/hero'

<Hero
  name="Bryan Fawcett"
  tagline="TECHNOLOGY LEADER"
  subtitle="Building Systems That Transform Communities"
  imageSrc="/profile.jpg"
  description={<>Your description with <span>highlights</span></>}
  primaryRole={{ title: "Role", subtitle: "Company" }}
  passionProject={{ title: "Project", subtitle: "Description" }}
  status={{ text: "Currently building", secondary: "Remote" }}
/>
```

### ErrorBoundary
Error boundary with retry functionality.

```tsx
import { ErrorBoundary, SectionErrorBoundary } from '@/components/error-boundary'

<ErrorBoundary fallback={<CustomError />}>
  <YourComponent />
</ErrorBoundary>

<SectionErrorBoundary sectionName="Projects">
  <ProjectsSection />
</SectionErrorBoundary>
```

### Skeleton Components
Loading state placeholders.

```tsx
import { Skeleton, SkeletonText, SkeletonCard, SkeletonHero } from '@/components/skeleton'

<Skeleton className="h-10 w-full" />
<SkeletonText lines={3} />
<SkeletonCard />
<SkeletonHero />
```

## CI/CD

### GitHub Actions

- **CI Pipeline** (`ci.yml`): Runs on every push and PR
  - Linting and type checking
  - Unit tests
  - Production build
  - Security audit

- **Claude Code Review** (`claude-review.yml`): AI-powered code review on every PR

### Dependabot

Automated dependency updates configured for:
- npm packages (weekly on Mondays)
- GitHub Actions

## Customization

### Profile Image
Replace `public/profile.jpg` with your own image. The Hero component will handle loading states and fallbacks automatically.

### Fonts
Fonts are loaded via Google Fonts in `app/layout.tsx`:
- **Noto Serif** - Headings
- **Poppins** - Body text
- **Dancing Script** - Cursive loading animation

### Colors
Theme colors are defined as CSS custom properties in `app/globals.css`. Supports both light and dark modes via oklch color space.

## Testing

```bash
# Run all tests
pnpm test:run

# Run tests in watch mode
pnpm test

# Run with coverage
pnpm test:coverage
```

Current coverage: 48 tests across 4 test files.

## Security

- Dependabot enabled for automated security updates
- Security audit runs in CI pipeline
- All external links use `rel="noopener noreferrer"`
- Error boundaries prevent crash propagation

## License

Open source under the [MIT License](LICENSE).

---

**Built by Bryan Fawcett**
