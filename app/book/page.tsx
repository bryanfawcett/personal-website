"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

export default function BookPage() {
  useEffect(() => {
    // Load Cal.com embed script
    const script = document.createElement("script")
    script.src = "https://app.cal.com/embed/embed.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://app.cal.com/embed/embed.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <nav className="max-w-4xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-medium hover:text-muted-foreground transition-colors"
          >
            Bryan Fawcett
          </Link>
          <ButtonGroup>
            <Button variant="outline" size="touch" className="text-sm" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="outline" size="touch" className="text-sm" asChild>
              <Link href="/experience">Experience</Link>
            </Button>
            <Button variant="outline" size="touch" className="text-sm" asChild>
              <Link href="/book">Book a Call</Link>
            </Button>
          </ButtonGroup>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        {/* Page Header */}
        <div className="space-y-4 mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-light">Book a Call</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let&apos;s discuss your project, explore collaboration opportunities, or talk about
            EdTech, digital transformation, and building for African communities.
          </p>
        </div>

        {/* What to Expect */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <div className="p-5 border border-border rounded-lg text-center">
            <div className="text-2xl mb-2">30</div>
            <div className="text-sm text-muted-foreground">Minutes</div>
          </div>
          <div className="p-5 border border-border rounded-lg text-center">
            <div className="text-2xl mb-2">Free</div>
            <div className="text-sm text-muted-foreground">No cost consultation</div>
          </div>
          <div className="p-5 border border-border rounded-lg text-center">
            <div className="text-2xl mb-2">Video</div>
            <div className="text-sm text-muted-foreground">Google Meet / Zoom</div>
          </div>
        </div>

        {/* Cal.com Embed */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div
            className="cal-embed min-h-[600px]"
            data-cal-link="bryanfawcett"
            data-cal-config='{"theme":"auto"}'
            style={{ width: "100%", height: "100%", overflow: "scroll" }}
          >
            {/* Fallback content while loading */}
            <div className="flex items-center justify-center min-h-[600px] p-8">
              <div className="text-center space-y-4">
                <div className="animate-pulse w-12 h-12 bg-muted rounded-full mx-auto" />
                <p className="text-muted-foreground">Loading calendar...</p>
                <p className="text-sm text-muted-foreground">
                  If the calendar doesn&apos;t load, you can{" "}
                  <a
                    href="https://cal.com/bryanfawcett"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
                  >
                    book directly on Cal.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Contact */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-muted-foreground">
            Prefer email? Reach out at{" "}
            <a
              href="mailto:bryan@nyuchi.com"
              className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
            >
              bryan@nyuchi.com
            </a>
          </p>
        </div>

        {/* Topics */}
        <section className="mt-16 pt-8 border-t border-border">
          <h2 className="text-2xl font-light mb-6 text-center">What We Can Discuss</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "EdTech Solutions",
                description: "Learning platforms, school systems, and educational technology strategy"
              },
              {
                title: "Web Development",
                description: "Full-stack development, React, Node.js, and modern web technologies"
              },
              {
                title: "Digital Transformation",
                description: "Systems architecture, cloud migration, and process optimization"
              },
              {
                title: "African Tech Initiatives",
                description: "Building for African communities, Nyuchi ecosystem, and regional projects"
              },
              {
                title: "IT Governance",
                description: "Security, compliance, privacy management, and best practices"
              },
              {
                title: "Consulting & Advisory",
                description: "Technical leadership, product strategy, and team mentorship"
              }
            ].map((topic) => (
              <div key={topic.title} className="p-5 border border-border rounded-lg">
                <h3 className="font-medium mb-1">{topic.title}</h3>
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Bryan Fawcett. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center">
              Home
            </Link>
            <Link href="/experience" className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center">
              Experience
            </Link>
            <Link href="/book" className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center">
              Book
            </Link>
          </div>
        </div>
      </footer>

      {/* Cal.com inline embed initialization */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function (C, A, L) {
              let p = function (a, ar) { a.q.push(ar); };
              let d = C.document;
              C.Cal = C.Cal || function () {
                let cal = C.Cal;
                let ar = arguments;
                if (!cal.loaded) {
                  cal.ns = {};
                  cal.q = cal.q || [];
                  d.head.appendChild(d.createElement("script")).src = A;
                  cal.loaded = true;
                }
                if (ar[0] === L) {
                  const api = function () { p(api, arguments); };
                  const namespace = ar[1];
                  api.q = api.q || [];
                  typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar);
                  return;
                }
                p(cal, ar);
              };
            })(window, "https://app.cal.com/embed/embed.js", "init");
            Cal("init", {origin:"https://cal.com"});
            Cal("inline", {
              elementOrSelector: ".cal-embed",
              calLink: "bryanfawcett",
              config: {"theme":"auto"}
            });
            Cal("ui", {"theme":"auto","styles":{"branding":{"brandColor":"#000000"}},"hideEventTypeDetails":false,"layout":"month_view"});
          `
        }}
      />
    </div>
  )
}
