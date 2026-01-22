import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

// Font CSS variables are defined in globals.css with system font fallbacks
// Google Fonts are loaded via CSS @import in the head for better offline compatibility

export const metadata: Metadata = {
  title: "Bryan Fawcett - Digital Craftsman",
  description:
    "Technology & Innovation Coordinator building digital ecosystems that unite and empower communities. Founder of Nyuchi Africa.",
  generator: "Next.js",
  authors: [{ name: "Bryan Fawcett", url: "https://bryanfawcett.com" }],
  creator: "Bryan Fawcett",
  publisher: "Bryan Fawcett",
  keywords: [
    "Bryan Fawcett",
    "Technology Coordinator",
    "EdTech",
    "Nyuchi Africa",
    "Singapore American School",
    "Digital Innovation",
    "Africa Tech",
    "Education Technology",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bryanfawcett.com",
    siteName: "Bryan Fawcett",
    title: "Bryan Fawcett - Digital Craftsman",
    description:
      "Technology & Innovation Coordinator building digital ecosystems that unite and empower communities. Founder of Nyuchi Africa.",
    images: [
      {
        url: "/profile.png",
        width: 1200,
        height: 630,
        alt: "Bryan Fawcett",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bryan Fawcett - Digital Craftsman",
    description:
      "Technology & Innovation Coordinator building digital ecosystems that unite and empower communities.",
    creator: "@bryanfawcett",
    images: ["/profile.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  metadataBase: new URL("https://bryanfawcett.com"),
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
