import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonHero,
  SkeletonSection,
  SkeletonProjectGrid
} from '../skeleton'

describe('Skeleton', () => {
  it('renders with default classes', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.firstChild as HTMLElement
    // shadcn Skeleton uses animate-pulse and bg-primary/10
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-10 w-full" />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('h-10', 'w-full')
  })

  it('renders as a div element', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton.tagName).toBe('DIV')
  })
})

describe('SkeletonText', () => {
  it('renders default 3 lines', () => {
    const { container } = render(<SkeletonText />)
    const lines = container.querySelectorAll('.h-4')
    expect(lines.length).toBe(3)
  })

  it('renders custom number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    const lines = container.querySelectorAll('.h-4')
    expect(lines.length).toBe(5)
  })

  it('last line is shorter (w-3/4)', () => {
    const { container } = render(<SkeletonText lines={3} />)
    const lines = container.querySelectorAll('.h-4')
    expect(lines[2]).toHaveClass('w-3/4')
    expect(lines[0]).toHaveClass('w-full')
    expect(lines[1]).toHaveClass('w-full')
  })
})

describe('SkeletonCard', () => {
  it('renders card structure', () => {
    const { container } = render(<SkeletonCard />)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('p-6', 'border', 'rounded-lg')
  })

  it('contains title and content skeletons', () => {
    const { container } = render(<SkeletonCard />)
    // Title skeleton (h-6 w-1/2)
    expect(container.querySelector('.h-6.w-1\\/2')).toBeInTheDocument()
    // Badge skeletons
    const badges = container.querySelectorAll('.h-6.w-16')
    expect(badges.length).toBe(2)
  })
})

describe('SkeletonHero', () => {
  it('renders with status role and label', () => {
    render(<SkeletonHero />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading content')).toBeInTheDocument()
  })

  it('renders full-screen background skeleton', () => {
    const { container } = render(<SkeletonHero />)
    const backgroundSkeleton = container.querySelector('.absolute.inset-0')
    expect(backgroundSkeleton).toBeInTheDocument()
  })
})

describe('SkeletonSection', () => {
  it('renders section structure', () => {
    const { container } = render(<SkeletonSection />)
    const section = container.firstChild as HTMLElement
    expect(section).toHaveClass('space-y-12')
  })

  it('contains heading skeleton', () => {
    const { container } = render(<SkeletonSection />)
    expect(container.querySelector('.h-10.w-64')).toBeInTheDocument()
  })

  it('contains grid with content', () => {
    const { container } = render(<SkeletonSection />)
    // Check for grid structure
    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
  })
})

describe('SkeletonProjectGrid', () => {
  it('renders 6 project card skeletons', () => {
    const { container } = render(<SkeletonProjectGrid />)
    const cards = container.querySelectorAll('.p-6.border')
    expect(cards.length).toBe(6)
  })

  it('has grid layout', () => {
    const { container } = render(<SkeletonProjectGrid />)
    const grid = container.querySelector('.grid.gap-4')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('lg:grid-cols-2')
  })
})
