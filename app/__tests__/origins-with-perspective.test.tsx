import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import OriginsWithPerspectivePage, { metadata } from '../origins-with-perspective/page'

vi.mock('next/navigation', () => ({
  usePathname: () => '/origins-with-perspective',
}))

const PRESENTATION_URL = 'https://origins-with-perspective.nyuchi.workers.dev'

describe('OriginsWithPerspectivePage', () => {
  it('renders the page title as the only h1', () => {
    render(<OriginsWithPerspectivePage />)

    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('Origins with a Perspective on Human Potential')
  })

  it('links to the standalone presentation', () => {
    render(<OriginsWithPerspectivePage />)

    const link = screen.getByRole('link', { name: 'Open the presentation' })
    expect(link).toHaveAttribute('href', PRESENTATION_URL)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('embeds the presentation with an accessible title', () => {
    render(<OriginsWithPerspectivePage />)

    const frame = screen.getByTitle(
      'Origins with a Perspective on Human Potential — presentation'
    )
    expect(frame).toHaveAttribute('src', PRESENTATION_URL)
    expect(frame).toHaveAttribute('loading', 'lazy')
  })

  it('covers the background, current work, and open questions', () => {
    render(<OriginsWithPerspectivePage />)

    expect(screen.getByRole('heading', { name: 'Why I gave this talk' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'How I got here' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: "What I'm working on now" })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The questions that matter' })).toBeInTheDocument()

    expect(screen.getByText(/Founder, Nyuchi Africa/)).toBeInTheDocument()
    expect(screen.getByText(/The Toddle transition/)).toBeInTheDocument()
  })

  it('exposes a canonical URL matching the route', () => {
    expect(metadata.alternates?.canonical).toBe(
      'https://bryanfawcett.com/origins-with-perspective'
    )
  })
})
