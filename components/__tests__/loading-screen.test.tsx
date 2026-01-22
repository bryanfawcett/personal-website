import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { LoadingScreen } from '../loading-screen'

describe('LoadingScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders with the name "Bryan Fawcett"', () => {
    render(<LoadingScreen />)
    expect(screen.getByText('Bryan Fawcett')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingScreen />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('renders loading dots', () => {
    render(<LoadingScreen />)
    const loadingDots = document.querySelectorAll('[aria-hidden="true"] > div')
    expect(loadingDots.length).toBe(3)
  })

  it('fades out after minimum display time', async () => {
    const onLoadingComplete = vi.fn()
    render(<LoadingScreen onLoadingComplete={onLoadingComplete} minimumDisplayTime={2500} />)

    // Should not have called callback yet
    expect(onLoadingComplete).not.toHaveBeenCalled()

    // Advance past minimum display time
    act(() => {
      vi.advanceTimersByTime(2500)
    })

    // Should start fading out
    const container = screen.getByRole('status')
    expect(container).toHaveClass('opacity-0')

    // Advance through fade out animation
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Should have called callback
    expect(onLoadingComplete).toHaveBeenCalledTimes(1)
  })

  it('uses custom minimum display time', () => {
    const onLoadingComplete = vi.fn()
    render(<LoadingScreen onLoadingComplete={onLoadingComplete} minimumDisplayTime={1000} />)

    // Advance to just before the custom time
    act(() => {
      vi.advanceTimersByTime(999)
    })
    expect(onLoadingComplete).not.toHaveBeenCalled()

    // Advance past the custom time + fade duration
    act(() => {
      vi.advanceTimersByTime(501)
    })
    expect(onLoadingComplete).toHaveBeenCalledTimes(1)
  })

  it('renders nothing after completion', async () => {
    const { container } = render(<LoadingScreen minimumDisplayTime={100} />)

    // Advance past loading time and fade
    act(() => {
      vi.advanceTimersByTime(600)
    })

    // Should be removed from DOM
    expect(container.firstChild).toBeNull()
  })
})
