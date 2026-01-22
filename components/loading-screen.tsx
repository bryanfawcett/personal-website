"use client"

import { useEffect, useState } from "react"

interface LoadingScreenProps {
  onLoadingComplete?: () => void
  minimumDisplayTime?: number
}

export function LoadingScreen({
  onLoadingComplete,
  minimumDisplayTime = 2500
}: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true)
      setTimeout(() => {
        setIsVisible(false)
        onLoadingComplete?.()
      }, 500)
    }, minimumDisplayTime)

    return () => clearTimeout(timer)
  }, [minimumDisplayTime, onLoadingComplete])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-8">
        {/* Animated cursive name */}
        <div className="relative">
          <h1
            className="font-cursive text-6xl sm:text-7xl md:text-8xl text-foreground animate-text-reveal"
            style={{ animationDelay: "0.3s" }}
          >
            Bryan Fawcett
          </h1>
          {/* Underline animation */}
          <div
            className="absolute -bottom-2 left-0 h-0.5 bg-foreground animate-text-reveal"
            style={{
              animationDelay: "1s",
              width: "100%"
            }}
          />
        </div>

        {/* Loading indicator */}
        <div className="flex items-center gap-2 mt-4">
          <LoadingDots />
        </div>
      </div>
    </div>
  )
}

function LoadingDots() {
  return (
    <div className="flex gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-muted-foreground"
          style={{
            animation: "skeleton-pulse 1s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}

export default LoadingScreen
