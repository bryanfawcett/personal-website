"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { ErrorBoundary, SectionErrorBoundary } from "@/components/error-boundary"
import { Hero } from "@/components/hero"
import { StickyNav } from "@/components/sticky-nav"
import { SkeletonHero, SkeletonSection, SkeletonProjectGrid } from "@/components/skeleton"

export default function Home() {
  const [isDark, setIsDark] = useState(true)
  const [activeSection, setActiveSection] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: "0px 0px -20% 0px" },
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [isLoading])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <ErrorBoundary>
      {/* Loading Screen */}
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}

      <div className={`min-h-screen bg-background text-foreground relative ${isLoading ? "overflow-hidden" : ""}`}>
        {/* Sticky Navigation - handles its own positioning via JS */}
        {!isLoading && <StickyNav />}

        <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
          <div className="flex flex-col gap-4">
            {["intro", "philosophy", "expertise", "projects", "connect"].map((section) => (
              <button
                key={section}
                onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" })}
                className={`w-2 h-8 rounded-full transition-all duration-500 ${
                  activeSection === section ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Navigate to ${section}`}
              />
            ))}
          </div>
        </nav>

        <main>
          <SectionErrorBoundary sectionName="Hero section">
            <header
              id="intro"
              ref={(el) => { sectionsRef.current[0] = el }}
              className="opacity-0"
            >
              {isLoading ? (
                <SkeletonHero />
              ) : (
                <Hero
                  name="Bryan Fawcett"
                  tagline="DIGITAL CRAFTSMAN / 2025"
                  subtitle="I craft dynamic ecosystems that unite and empower communities."
                  imageSrc="/profile.png"
                  imageAlt="Bryan Fawcett"
                  description={
                    <>
                      Technology & Innovation Coordinator at{" "}
                      <span className="text-foreground">Singapore American School</span>, building my passion at{" "}
                      <span className="text-foreground">Nyuchi Africa</span>. Creating digital experiences through{" "}
                      <span className="text-foreground">innovation</span>,{" "}
                      <span className="text-foreground">resourcefulness</span>, and{" "}
                      <span className="text-foreground">intentional design</span>.
                    </>
                  }
                  status={{
                    text: "Building at Nyuchi Africa",
                    secondary: "Remote-first & Africa-focused"
                  }}
                  primaryRole={{
                    title: "Technology & Innovation Coordinator",
                    subtitle: "Singapore American School"
                  }}
                  passionProject={{
                    title: "Nyuchi Africa Ecosystem",
                    subtitle: "Learning, travel, and community platforms"
                  }}
                />
              )}
            </header>
          </SectionErrorBoundary>


          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
            <SectionErrorBoundary sectionName="Philosophy section">
              <section
                id="philosophy"
                ref={(el) => { sectionsRef.current[1] = el }}
                className="min-h-screen py-20 sm:py-32 opacity-0 flex items-center"
              >
              {isLoading ? (
                <SkeletonSection />
              ) : (
                <div className="space-y-12 sm:space-y-16 w-full">
                  <h2 className="text-3xl sm:text-4xl font-light">Philosophy & Approach</h2>

                  <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium font-poppins">Resourceful Innovation</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Growing up in Africa taught me to do more with less and find elegant solutions under constraints.
                          This informs every system I build—efficient, resilient, and designed for impact.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium font-poppins">Community First</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Whether at SAS or driving Nyuchi Africa, I believe technology should serve people and empower
                          communities. Solutions must be accessible and meaningful.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium font-poppins">Excellence & Trust</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Security, governance, and best practices aren&apos;t afterthoughts—they&apos;re foundational. I build systems
                          that educators, travelers, and communities can rely on.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium font-poppins">Knowledge Transfer</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Clear documentation and mentorship multiply impact. I empower teams and individuals through
                          education and shared understanding.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Expertise section">
            <section
              id="expertise"
              ref={(el) => { sectionsRef.current[2] = el }}
              className="min-h-screen py-20 sm:py-32 opacity-0"
            >
              <div className="space-y-12 sm:space-y-16">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <h2 className="text-3xl sm:text-4xl font-light">Core Competencies</h2>
                  <div className="text-sm text-muted-foreground font-mono">10+ Years in Enterprise Tech</div>
                </div>

                <div className="space-y-8 sm:space-y-12">
                  {[
                    {
                      title: "Full Stack Development",
                      description:
                        "End-to-end web applications from architecture to deployment. Expertise in React, Node.js, and modern web technologies. Building educational platforms, travel systems, and community tools.",
                      highlights: ["Node.js", "React", "Database Design", "API Architecture"],
                    },
                    {
                      title: "Systems Architecture",
                      description:
                        "Designing scalable, resilient systems that serve real needs. From learning management platforms to information systems and organizational dashboards—built for reliability and growth.",
                      highlights: ["Infrastructure Design", "System Scalability", "Data Architecture"],
                    },
                    {
                      title: "Education Technology",
                      description:
                        "Deep expertise in EdTech solutions that enhance learning at scale. Building platforms that empower educators and students with accessible, intuitive tools and resources.",
                      highlights: ["Learning Platforms", "Educational Tools", "EdTech Strategy"],
                    },
                    {
                      title: "Digital Product Strategy",
                      description:
                        "End-to-end product development from concept to market. Creating digital experiences that serve communities—from travel platforms to learning ecosystems to tech director networks.",
                      highlights: ["Product Vision", "Technical Leadership", "Community Impact"],
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="group grid lg:grid-cols-12 gap-4 sm:gap-8 py-6 sm:py-8 border-b border-border/50 hover:border-border transition-colors duration-500"
                    >
                      <div className="lg:col-span-4">
                        <h3 className="text-lg sm:text-xl font-medium group-hover:text-muted-foreground transition-colors duration-500">
                          {item.title}
                        </h3>
                      </div>

                      <div className="lg:col-span-8 space-y-4">
                        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.highlights.map((highlight) => (
                            <span
                              key={highlight}
                              className="px-2 py-1 text-xs text-muted-foreground rounded group-hover:border-muted-foreground/50 transition-colors duration-500"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Projects section">
            <section
              id="projects"
              ref={(el) => { sectionsRef.current[3] = el }}
              className="min-h-screen py-20 sm:py-32 opacity-0"
            >
              <div className="space-y-12 sm:space-y-16">
                <h2 className="text-3xl sm:text-4xl font-light">Projects & Work</h2>

                {isLoading ? (
                  <SkeletonProjectGrid />
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-muted-foreground font-mono">NYUCHI AFRICA ECOSYSTEM</h3>
                      <p className="text-sm text-muted-foreground max-w-2xl mb-6">
                        My passion project building digital solutions across Africa—from educational platforms to travel
                        systems and community networks.
                      </p>
                      <div className="grid gap-4 lg:grid-cols-2">
                        {[
                          {
                            title: "Nyuchi Africa",
                            url: "https://www.nyuchi.com",
                            description: "Community-focused business platform for African entrepreneurship",
                          },
                          {
                            title: "Nyuchi Learning",
                            url: "https://learning.nyuchi.com",
                            description: "Open-source K-12 digital transformation frameworks for African schools",
                          },
                          {
                            title: "Mukoko",
                            url: "https://mukoko.com",
                            description: "Privacy-focused social platform with 6 integrated apps",
                          },
                          {
                            title: "Mukoko News",
                            url: "https://news.mukoko.com",
                            description: "Pan-African news aggregation from trusted regional sources",
                          },
                          {
                            title: "Nhimbe",
                            url: "https://nhimbe.com",
                            description: "Community events and gatherings platform",
                          },
                          {
                            title: "Zimbabwe Travel Info",
                            url: "https://travel-info.co.zw",
                            description: "Comprehensive travel guide for Zimbabwe",
                          },
                          {
                            title: "Iconic Expeditions",
                            url: "https://iconic-expeditions.com",
                            description: "Luxury bespoke safaris across Southern and Eastern Africa",
                          },
                          {
                            title: "Nyuchi Lingo",
                            url: "https://lingo.nyuchi.com",
                            description: "Language learning platform for African languages",
                          },
                        ].map((project) => (
                          <Link
                            key={project.title}
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg"
                          >
                            <div className="space-y-2">
                              <h4 className="text-base font-medium group-hover:text-muted-foreground transition-colors duration-300">
                                {project.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">{project.description}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                <span>Visit project</span>
                                <svg
                                  className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                  />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 space-y-4 border-t border-border/50">
                      <h3 className="text-lg font-medium text-muted-foreground font-mono">SINGAPORE AMERICAN SCHOOL</h3>
                      <p className="text-sm text-muted-foreground max-w-2xl mb-6">
                        Technology & Innovation Coordinator building educational platforms and digital tools for learning.
                      </p>
                      <div className="grid gap-4 lg:grid-cols-2">
                        {[
                          {
                            title: "Digital Toolkit",
                            repo: "SAS-Technology-Innovation/digital-toolkit",
                            description: "Comprehensive digital tools and resources",
                          },
                          {
                            title: "Knowledge Base",
                            repo: "SAS-Technology-Innovation/knowledge",
                            description: "Centralized knowledge management system",
                          },
                          {
                            title: "Educator Eval",
                            repo: "SAS-Technology-Innovation/EducatorEval",
                            description: "Educator evaluation and assessment platform",
                          },
                          {
                            title: "EOI Dashboard",
                            repo: "SAS-Technology-Innovation/Expression-of-Interest-Dashboard",
                            description: "Expression of interest tracking dashboard",
                          },
                        ].map((project) => (
                          <Link
                            key={project.repo}
                            href={`https://github.com/${project.repo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                <h4 className="text-base font-medium group-hover:text-muted-foreground transition-colors duration-300">
                                  {project.title}
                                </h4>
                              </div>
                              <p className="text-sm text-muted-foreground">{project.description}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                <span>View repository</span>
                                <svg
                                  className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                  />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Connect section">
            <section id="connect" ref={(el) => { sectionsRef.current[4] = el }} className="py-20 sm:py-32 opacity-0">
              <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
                <div className="space-y-6 sm:space-y-8">
                  <h2 className="text-3xl sm:text-4xl font-light">Let&apos;s Connect</h2>

                  <div className="space-y-6">
                    <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                      Whether you&apos;re interested in EdTech solutions, African tech initiatives, or digital innovation
                      strategy, I&apos;d love to explore opportunities for collaboration and meaningful impact.
                    </p>

                    <div className="space-y-4">
                      <Link
                        href="mailto:bryan@nyuchi.com"
                        className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
                      >
                        <span className="text-base sm:text-lg">bryan@nyuchi.com</span>
                        <svg
                          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  <div className="text-sm text-muted-foreground font-mono">CONNECT WITH ME</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        name: "LinkedIn",
                        handle: "bryandavidfawcett",
                        url: "https://www.linkedin.com/in/bryandavidfawcett/",
                      },
                      { name: "GitHub", handle: "bryanfawcett", url: "https://github.com/bryanfawcett/" },
                      { name: "Twitter", handle: "@bryanfawcett", url: "https://x.com/bryanfawcett" },
                      { name: "Email", handle: "bryan@nyuchi.com", url: "mailto:bryan@nyuchi.com" },
                    ].map((social) => (
                      <Link
                        key={social.name}
                        href={social.url}
                        target={social.url.startsWith("http") ? "_blank" : undefined}
                        rel={social.url.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="group p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm"
                      >
                        <div className="space-y-2">
                          <div className="text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                            {social.name}
                          </div>
                          <div className="text-sm text-muted-foreground">{social.handle}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            </SectionErrorBoundary>

            <footer className="py-12 sm:py-16 border-t border-border">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">© 2025 Bryan Fawcett. All rights reserved.</div>
                  <div className="text-xs text-muted-foreground">
                    Digital craftsman, builder of communities
                  </div>
                </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <svg
                      className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
                </div>
              </div>
            </footer>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      </div>
    </ErrorBoundary>
  )
}
