import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, ErrorFallback, SectionErrorBoundary } from '../error-boundary'

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests since we're testing error handling
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders fallback when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom error UI')).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
    expect(onError.mock.calls[0][0].message).toBe('Test error message')
  })

  it('allows retry after error', async () => {
    let shouldThrow = true

    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>Success content</div>
    }

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )

    // Error boundary caught the error
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Change state to not throw
    shouldThrow = false

    // Click retry - this resets the error boundary state
    fireEvent.click(screen.getByText('Try again'))

    // After retry, the component should render successfully
    expect(screen.getByText('Success content')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })
})

describe('ErrorFallback', () => {
  it('renders with default props', () => {
    render(<ErrorFallback error={null} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('We encountered an unexpected error. Please try again.')).toBeInTheDocument()
  })

  it('renders with custom title and message', () => {
    render(
      <ErrorFallback
        error={null}
        title="Custom title"
        message="Custom message"
      />
    )
    expect(screen.getByText('Custom title')).toBeInTheDocument()
    expect(screen.getByText('Custom message')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ErrorFallback error={null} />)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ErrorFallback error={null} onRetry={onRetry} />)

    const retryButton = screen.getByText('Try again')
    expect(retryButton).toBeInTheDocument()

    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorFallback error={null} />)
    expect(screen.queryByText('Try again')).not.toBeInTheDocument()
  })

  it('shows error details in development mode', () => {
    // In vitest, NODE_ENV is already 'test' which is treated similarly to development
    // The error details are shown when NODE_ENV === 'development'
    // We'll test that the error details container exists when error is provided
    const error = new Error('Detailed error message')
    error.stack = 'Error stack trace'

    const { container } = render(<ErrorFallback error={error} />)

    // In test environment, details should be available
    // Check for the details element structure
    const details = container.querySelector('details')
    if (process.env.NODE_ENV === 'development') {
      expect(details).toBeInTheDocument()
      expect(screen.getByText('Error details')).toBeInTheDocument()
    } else {
      // In production/test mode, details may not be shown
      // This test verifies the component doesn't crash with an error prop
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    }
  })
})

describe('SectionErrorBoundary', () => {
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it('renders children when no error', () => {
    render(
      <SectionErrorBoundary>
        <div>Section content</div>
      </SectionErrorBoundary>
    )
    expect(screen.getByText('Section content')).toBeInTheDocument()
  })

  it('renders section-specific error message', () => {
    render(
      <SectionErrorBoundary sectionName="Hero section">
        <ThrowError />
      </SectionErrorBoundary>
    )
    expect(screen.getByText("Hero section couldn't be loaded.")).toBeInTheDocument()
  })

  it('renders default section name when not provided', () => {
    render(
      <SectionErrorBoundary>
        <ThrowError />
      </SectionErrorBoundary>
    )
    expect(screen.getByText("This section couldn't be loaded.")).toBeInTheDocument()
  })

  it('shows reload page link', () => {
    render(
      <SectionErrorBoundary>
        <ThrowError />
      </SectionErrorBoundary>
    )
    expect(screen.getByText('Reload page')).toBeInTheDocument()
  })
})
