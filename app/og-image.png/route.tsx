import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Bryan Fawcett - Digital Craftsman"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          {/* Name */}
          <h1
            style={{
              fontSize: 72,
              fontWeight: 300,
              color: "#ffffff",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Bryan Fawcett
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontSize: 28,
              color: "#a0a0a0",
              margin: "16px 0 0 0",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Digital Craftsman
          </p>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 24,
              color: "#707070",
              margin: "32px 0 0 0",
              maxWidth: 800,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            Technology & Innovation Coordinator | Founder of Nyuchi Africa
          </p>

          {/* URL */}
          <p
            style={{
              fontSize: 18,
              color: "#505050",
              margin: "48px 0 0 0",
              letterSpacing: "0.1em",
            }}
          >
            bryanfawcett.com
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
