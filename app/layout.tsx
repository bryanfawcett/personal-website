import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"

// Font CSS variables are defined in globals.css with system font fallbacks
// Google Fonts are loaded via CSS @import in the head for better offline compatibility

const siteConfig = {
  name: "Bryan Fawcett",
  title: "Bryan Fawcett - Digital Craftsman",
  description:
    "Technology & Innovation Coordinator building digital ecosystems that unite and empower communities. Founder of Nyuchi Africa.",
  url: "https://bryanfawcett.com",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/bryanfawcett",
    github: "https://github.com/bryanfawcett",
    linkedin: "https://linkedin.com/in/bryandavidfawcett",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  generator: "Next.js",
  applicationName: siteConfig.name,
  referrer: "origin-when-cross-origin",
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [
    "Bryan Fawcett",
    "Technology Coordinator",
    "EdTech",
    "Nyuchi Africa",
    "Singapore American School",
    "Digital Innovation",
    "Africa Tech",
    "Education Technology",
    "Zimbabwe",
    "Mukoko",
    "Digital Craftsman",
    "Systems Architect",
  ],
  category: "technology",
  classification: "Personal Portfolio",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#0a0a0a" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    firstName: "Bryan",
    lastName: "Fawcett",
    username: "bryanfawcett",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Digital Craftsman`,
        type: "image/png",
      },
      {
        url: "/profile.png",
        width: 800,
        height: 800,
        alt: siteConfig.name,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@bryanfawcett",
    creator: "@bryanfawcett",
    title: siteConfig.title,
    description: siteConfig.description,
    images: {
      url: siteConfig.ogImage,
      alt: `${siteConfig.name} - Digital Craftsman`,
    },
  },
  verification: {
    // Add verification tokens when available
    // google: "google-site-verification-token",
    // yandex: "yandex-verification-token",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-config": "/browserconfig.xml",
  },
}

// JSON-LD Structured Data for SEO and AI systems
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://bryanfawcett.com/#person",
      name: "Bryan Fawcett",
      givenName: "Bryan",
      familyName: "Fawcett",
      jobTitle: "Technology & Innovation Coordinator",
      description:
        "Technology & Innovation Coordinator building digital ecosystems that unite and empower communities. Founder of Nyuchi Africa.",
      url: "https://bryanfawcett.com",
      image: {
        "@type": "ImageObject",
        url: "https://bryanfawcett.com/profile.png",
        width: 800,
        height: 800,
      },
      sameAs: [
        "https://linkedin.com/in/bryandavidfawcett",
        "https://github.com/bryanfawcett",
        "https://twitter.com/bryanfawcett",
        "https://nyuchi.com",
      ],
      worksFor: {
        "@type": "EducationalOrganization",
        name: "Singapore American School",
        url: "https://www.sas.edu.sg",
      },
      founder: {
        "@type": "Organization",
        name: "Nyuchi Africa",
        url: "https://nyuchi.com",
      },
      knowsAbout: [
        "Education Technology",
        "Systems Architecture",
        "Cybersecurity",
        "Digital Innovation",
        "IT Governance",
        "Process Optimization",
      ],
      alumniOf: [
        {
          "@type": "EducationalOrganization",
          name: "Osaka YMCA International School",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://bryanfawcett.com/#website",
      url: "https://bryanfawcett.com",
      name: "Bryan Fawcett - Digital Craftsman",
      description:
        "Personal portfolio of Bryan Fawcett - Technology & Innovation Coordinator and founder of Nyuchi Africa.",
      publisher: {
        "@id": "https://bryanfawcett.com/#person",
      },
      inLanguage: "en-US",
    },
    {
      "@type": "ProfilePage",
      "@id": "https://bryanfawcett.com/#profilepage",
      url: "https://bryanfawcett.com",
      name: "Bryan Fawcett - Digital Craftsman",
      isPartOf: {
        "@id": "https://bryanfawcett.com/#website",
      },
      about: {
        "@id": "https://bryanfawcett.com/#person",
      },
      mainEntity: {
        "@id": "https://bryanfawcett.com/#person",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://nyuchi.com/#organization",
      name: "Nyuchi Africa",
      url: "https://nyuchi.com",
      logo: "https://nyuchi.com/logo.png",
      description:
        "Community-focused business platform for African entrepreneurship built on the Ubuntu philosophy.",
      founder: {
        "@id": "https://bryanfawcett.com/#person",
      },
      sameAs: ["https://github.com/nyuchitech"],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://nyuchi.com" />
        <link rel="dns-prefetch" href="https://github.com" />

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Noto+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-poppins antialiased">{children}</body>
    </html>
  )
}
