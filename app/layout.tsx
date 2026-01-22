import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

// Font CSS variables are defined in globals.css with system font fallbacks
// Google Fonts are loaded via CSS @import in the head for better offline compatibility

export const metadata: Metadata = {
  title: "Bryan Fawcett - Digital Craftsman",
  description:
    "I craft dynamic ecosystems that unite and empower communities.",
  generator: "v0.app",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Noto+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-poppins antialiased">{children}</body>
    </html>
  )
}
