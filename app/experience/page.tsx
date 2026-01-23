"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"

interface Experience {
  title: string
  company: string
  location: string
  period: string
  duration: string
  description: string[]
  skills?: string[]
  type: "work" | "education"
}

const experiences: Experience[] = [
  {
    title: "Technology & Innovation Coordinator",
    company: "Singapore American School",
    location: "Singapore",
    period: "2023 - Present",
    duration: "Current",
    type: "work",
    description: [
      "Leading technology integration within educational practices and operational efficiencies",
      "Previously served as Privacy & Governance Manager and IT Infrastructure Manager",
      "Driving digital transformation initiatives across the school"
    ],
    skills: ["EdTech", "IT Governance", "Privacy", "Infrastructure"]
  },
  {
    title: "Founder & Director",
    company: "Nyuchi Africa",
    location: "Remote / Africa",
    period: "Oct 2016 - Present",
    duration: "8+ years",
    type: "work",
    description: [
      "Building digital solutions for African communities under the Ubuntu philosophy",
      "Web development company specializing in web design, hosting, and digital integration",
      "Growing ecosystem of brands including Nyuchi Learning, Mukoko, and travel platforms",
      "Helping companies digitalize workplaces to become eco-friendly and reduce carbon footprint"
    ],
    skills: ["Web Development", "Digital Strategy", "Entrepreneurship", "Community Building"]
  },
  {
    title: "Safari Specialist",
    company: "Iconic Expeditions",
    location: "Southern & Eastern Africa",
    period: "Mar 2022 - Present",
    duration: "3+ years",
    type: "work",
    description: [
      "System administrator and web developer for luxury safari company",
      "Safari specialist focusing on Asian and American markets",
      "Web development, user administration, and handling client requests",
      "Finding and booking lodging and experiences throughout southern and eastern Africa"
    ],
    skills: ["Web Development", "System Administration", "Tourism", "Client Relations"]
  },
  {
    title: "IT Specialist & Activities Coordinator",
    company: "Osaka YMCA International School",
    location: "Osaka, Japan",
    period: "Nov 2019 - 2023",
    duration: "4 years",
    type: "work",
    description: [
      "ICT Coordinator and Network Manager for Secondary School",
      "Implemented and maintained LMS and student service systems (Google Workspace, OpenApply, Managebac)",
      "Set up and managed all technology at new high school campus including network, CCTV, and classroom tech",
      "Built visualizations and reports using Looker Studio for behavior and medical data",
      "Hardware management across Linux, Windows, MacOS, iOS, tvOS, ChromeOS using Mosyle",
      "Outdoors Education and PHE Educator - planned excursions and coached sports"
    ],
    skills: ["Network Management", "Google Workspace", "MDM", "Data Visualization", "Education"]
  },
  {
    title: "Zimbabwe Director",
    company: "Shadows of Africa Ltd",
    location: "Zimbabwe",
    period: "Apr 2017 - Apr 2018",
    duration: "1 year",
    type: "work",
    description: [
      "Built custom itineraries for guests' preferences",
      "Destination Management Company operations",
      "Provided 24/7 service coordination with private vehicles, guides, and hosts",
      "Vehicle handling for partner companies"
    ],
    skills: ["Tourism", "Destination Management", "Client Relations"]
  },
  {
    title: "School Administrator & Assistant Principal",
    company: "St. John the Baptist Catholic School",
    location: "Johannesburg, South Africa",
    period: "Jan 2016 - Jul 2016",
    duration: "7 months",
    type: "work",
    description: [
      "Directed primary student accounts and communicated with parents on school events",
      "Led instructional technology & curriculum development for all staff",
      "Developed online presence with website and social media",
      "Infrastructure Manager - managed projects for campus expansion",
      "Maintained school facilities and grounds"
    ],
    skills: ["School Administration", "Curriculum Development", "Infrastructure"]
  },
  {
    title: "High School Teacher",
    company: "St. John the Baptist Catholic School",
    location: "Johannesburg, South Africa",
    period: "Jan 2014 - Dec 2015",
    duration: "2 years",
    type: "work",
    description: [
      "History, Geography, Biology teacher for Grades 6-10",
      "Developed hands-on curriculum for students from underserved communities in Roodepoort",
      "Cambridge Checkpoint and IGCSE curriculum design and management",
      "Coached swimming and taught after-school physical health"
    ],
    skills: ["Teaching", "Curriculum Design", "Cambridge IGCSE", "Coaching"]
  },
  {
    title: "Teacher",
    company: "St. John's College",
    location: "Harare, Zimbabwe",
    period: "Oct 2012 - Aug 2013",
    duration: "11 months",
    type: "work",
    description: [
      "Form 1, 2, and 3 Teacher - Geography, IT, and History",
      "Coached junior high school cricket and field hockey",
      "Technical support for students, teachers, and extracurricular activities",
      "Camp director for Grade 8 outdoor education during Introductions"
    ],
    skills: ["Teaching", "IT Support", "Coaching", "Outdoor Education"]
  },
  {
    title: "Head of Products",
    company: "eLearning Solutions",
    location: "Zimbabwe",
    period: "Mar 2012 - Dec 2012",
    duration: "10 months",
    type: "work",
    description: [
      "Worked with schools to implement Learnthings Digital Content",
      "Intel Teach & Learnthings Digital Content training course facilitation",
      "Sales presentations to companies and schools",
      "Software troubleshooting and installations in computer labs",
      "21st Century Learning workshops and professional development training"
    ],
    skills: ["EdTech Sales", "Training", "Software Installation", "Professional Development"]
  },
  {
    title: "Secondary Education Diploma of Teaching",
    company: "Midlands Christian Training Centre",
    location: "Zimbabwe",
    period: "Graduated Dec 2012",
    duration: "",
    type: "education",
    description: [
      "Teacher training qualification"
    ]
  },
  {
    title: "Google IT Support Certificate",
    company: "Google",
    location: "Online",
    period: "Sept 2022",
    duration: "",
    type: "education",
    description: [
      "Professional certification in IT support fundamentals"
    ]
  },
  {
    title: "CompTIA A+",
    company: "CompTIA",
    location: "Online",
    period: "Nov 2022",
    duration: "",
    type: "education",
    description: [
      "Industry-standard IT certification"
    ]
  },
  {
    title: "Google Project Management Certificate",
    company: "Google",
    location: "Online",
    period: "2023",
    duration: "",
    type: "education",
    description: [
      "Professional certification in project management"
    ]
  }
]

export default function ExperiencePage() {
  const [filter, setFilter] = useState<"all" | "work" | "education">("all")

  const filteredExperiences = experiences.filter(
    exp => filter === "all" || exp.type === filter
  )

  const workExperiences = filteredExperiences.filter(exp => exp.type === "work")
  const educationExperiences = filteredExperiences.filter(exp => exp.type === "education")

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <nav className="max-w-4xl mx-auto px-6 sm:px-8 py-3 flex items-center justify-between" aria-label="Main navigation">
          <Link
            href="/"
            className="text-lg font-medium hover:text-muted-foreground transition-colors min-h-[44px] flex items-center"
          >
            Bryan Fawcett
          </Link>
          <ButtonGroup>
            <Button variant="outline" size="touch" className="text-sm" asChild>
              <Link href="/">Profile</Link>
            </Button>
            <Button variant="default" size="touch" className="text-sm" asChild>
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
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-light">Experience</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Over 10 years of experience in education technology, systems architecture,
            and digital product development across Africa and Asia.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="touch"
            onClick={() => setFilter("all")}
            className="text-sm"
          >
            All
          </Button>
          <Button
            variant={filter === "work" ? "default" : "outline"}
            size="touch"
            onClick={() => setFilter("work")}
            className="text-sm"
          >
            Work
          </Button>
          <Button
            variant={filter === "education" ? "default" : "outline"}
            size="touch"
            onClick={() => setFilter("education")}
            className="text-sm"
          >
            Education
          </Button>
        </div>

        {/* Work Experience Timeline */}
        {workExperiences.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-light mb-8 text-muted-foreground">Work Experience</h2>
            <div className="space-y-8">
              {workExperiences.map((exp) => (
                <article
                  key={`${exp.company}-${exp.period}`}
                  className="relative pl-8 pb-8 border-l-2 border-border last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-foreground" />

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-medium">{exp.title}</h3>
                        <p className="text-muted-foreground">{exp.company}</p>
                      </div>
                      <div className="text-sm text-muted-foreground text-left sm:text-right">
                        <div>{exp.period}</div>
                        <div className="text-xs">{exp.location}</div>
                        {exp.duration && (
                          <Badge variant="secondary" className="mt-1">
                            {exp.duration}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-2 text-muted-foreground">
                      {exp.description.map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-foreground/50 mt-1.5 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {exp.skills && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {exp.skills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Education & Certifications */}
        {educationExperiences.length > 0 && (
          <section>
            <h2 className="text-2xl font-light mb-8 text-muted-foreground">Education & Certifications</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {educationExperiences.map((exp) => (
                <article
                  key={`${exp.company}-${exp.period}`}
                  className="p-5 border border-border rounded-lg"
                >
                  <h3 className="font-medium">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground mt-1">{exp.period}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Skills Summary */}
        <section className="mt-16 pt-8 border-t border-border">
          <h2 className="text-2xl font-light mb-6 text-muted-foreground">Core Skills</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Windows Server", "Linux", "MacOS", "iOS", "ChromeOS",
              "Web Development", "UI/UX Design", "React", "Node.js",
              "Google Workspace", "Project Management", "Network Security",
              "Systems Administration", "MDM Management", "Cloud Services (AWS, Azure)",
              "Database Design", "API Architecture", "Digital Payment Systems"
            ].map(skill => (
              <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 pt-8 border-t border-border text-center">
          <h2 className="text-2xl font-light mb-4">Interested in working together?</h2>
          <p className="text-muted-foreground mb-6">
            Let&apos;s discuss how I can help with your EdTech, digital transformation, or development needs.
          </p>
          <Button size="touch" asChild>
            <Link href="/book">Book a Call</Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Bryan Fawcett. All rights reserved.
          </p>
          <nav className="flex gap-4" aria-label="Footer navigation">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center">
              Profile
            </Link>
            <Link href="/experience" className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center">
              Experience
            </Link>
            <Link href="/book" className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center">
              Book a Call
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
