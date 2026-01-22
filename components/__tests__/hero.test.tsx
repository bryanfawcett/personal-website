import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Hero } from '../hero'

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, onLoad, onError, className, ...props }: {
    src: string
    alt: string
    onLoad?: () => void
    onError?: () => void
    className?: string
    [key: string]: unknown
  }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={onError}
      data-testid="hero-image"
      {...props}
    />
  )
}))

describe('Hero', () => {
  it('renders with default props', () => {
    render(<Hero />)
    expect(screen.getByText('Bryan Fawcett')).toBeInTheDocument()
    expect(screen.getByText('DIGITAL CRAFTSMAN / 2025')).toBeInTheDocument()
    expect(screen.getByText('I craft dynamic ecosystems that unite and empower communities.')).toBeInTheDocument()
  })

  it('renders custom name and tagline', () => {
    render(
      <Hero
        name="John Doe"
        tagline="CUSTOM TAGLINE / 2025"
        subtitle="Custom Subtitle"
      />
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('CUSTOM TAGLINE / 2025')).toBeInTheDocument()
    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<Hero description="This is a test description" />)
    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  it('renders status indicator when provided', () => {
    render(
      <Hero
        description="Test description"
        status={{
          text: "Currently building",
          secondary: "Remote work"
        }}
      />
    )
    expect(screen.getByText('Currently building')).toBeInTheDocument()
    expect(screen.getByText('Remote work')).toBeInTheDocument()
  })

  it('renders primary role when provided', () => {
    render(
      <Hero
        primaryRole={{
          title: "Software Engineer",
          subtitle: "Big Tech Company"
        }}
      />
    )
    expect(screen.getByText('PRIMARY ROLE')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Big Tech Company')).toBeInTheDocument()
  })

  it('renders passion project when provided', () => {
    render(
      <Hero
        passionProject={{
          title: "Open Source Project",
          subtitle: "Making the world better"
        }}
      />
    )
    expect(screen.getByText('PASSION PROJECT')).toBeInTheDocument()
    expect(screen.getByText('Open Source Project')).toBeInTheDocument()
    expect(screen.getByText('Making the world better')).toBeInTheDocument()
  })

  it('renders image with correct alt text', () => {
    render(<Hero imageAlt="Custom alt text" />)
    expect(screen.getByAltText('Custom alt text')).toBeInTheDocument()
  })

  it('shows skeleton while image is loading', () => {
    const { container } = render(<Hero />)
    // Skeleton should be visible before image loads
    const skeleton = container.querySelector('.animate-skeleton')
    expect(skeleton).toBeInTheDocument()
  })

  it('hides skeleton after image loads', async () => {
    const { container } = render(<Hero />)
    const image = screen.getByTestId('hero-image')

    // Simulate image load
    fireEvent.load(image)

    await waitFor(() => {
      const skeleton = container.querySelector('.animate-skeleton.absolute')
      expect(skeleton).not.toBeInTheDocument()
    })
  })

  it('shows fallback gradient when image fails to load', async () => {
    const { container } = render(<Hero />)
    const image = screen.getByTestId('hero-image')

    // Simulate image error
    fireEvent.error(image)

    await waitFor(() => {
      // Fallback gradient should be shown
      const fallbackGradient = container.querySelector('.bg-gradient-to-b')
      expect(fallbackGradient).toBeInTheDocument()
    })
  })

  it('renders full-screen hero with proper structure', () => {
    const { container } = render(<Hero />)
    // Uses h-[100dvh] for mobile browser compatibility
    const heroContainer = container.querySelector('[class*="h-"]')
    expect(heroContainer).toBeInTheDocument()
  })

  it('renders centered text in hero area', () => {
    const { container } = render(<Hero />)
    const textContainer = container.querySelector('.text-center')
    expect(textContainer).toBeInTheDocument()
  })

  it('renders ReactNode description correctly', () => {
    render(
      <Hero
        description={
          <>
            Text with <span data-testid="highlight">highlighted</span> content
          </>
        }
      />
    )
    expect(screen.getByTestId('highlight')).toBeInTheDocument()
    expect(screen.getByText('highlighted')).toBeInTheDocument()
  })

  it('renders default social links', () => {
    render(<Hero />)
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument()
    expect(screen.getByLabelText('TikTok')).toBeInTheDocument()
    expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument()
  })

  it('renders default section chips', () => {
    render(<Hero />)
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders custom social links', () => {
    const customLinks = [
      {
        name: 'Custom',
        href: 'https://example.com',
        icon: <span data-testid="custom-icon">Icon</span>
      }
    ]
    render(<Hero socialLinks={customLinks} />)
    expect(screen.getByLabelText('Custom')).toBeInTheDocument()
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders custom section chips', () => {
    const customChips = [
      { label: 'Custom Section', href: '#custom' }
    ]
    render(<Hero sectionChips={customChips} />)
    expect(screen.getByText('Custom Section')).toBeInTheDocument()
  })
})
