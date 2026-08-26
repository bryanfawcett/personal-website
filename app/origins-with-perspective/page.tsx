import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlobalNav } from "@/components/global-nav"

const PRESENTATION_URL = "https://origins-with-perspective.nyuchi.workers.dev"
const PAGE_URL = "https://bryanfawcett.com/origins-with-perspective"

export const metadata: Metadata = {
  title: "Origins with a Perspective on Human Potential",
  description:
    "A talk on equity and the assumptions we make in learning — what growing up in Zimbabwe taught me about measuring capability instead of credentials, and how that shapes the technology work I do now.",
  keywords: [
    "Equity in Education",
    "Assessment",
    "Zimbabwe",
    "Daniel Pink",
    "A Whole New Mind",
    "Conceptual Age",
    "Singapore American School",
    "EdTech",
    "Human Potential",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "article",
    url: PAGE_URL,
    title: "Origins with a Perspective on Human Potential",
    description:
      "Equity: the assumptions we make in learning. A Zimbabwe perspective on capability, credentials, and what we might be measuring wrong.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Origins with a Perspective on Human Potential",
    description:
      "Equity: the assumptions we make in learning. A Zimbabwe perspective on capability, credentials, and what we might be measuring wrong.",
  },
}

interface Milestone {
  period: string
  place: string
  title: string
  detail: string
}

const path: Milestone[] = [
  {
    period: "2012",
    place: "Zimbabwe",
    title: "Head of Products, eLearning Solutions",
    detail:
      "Took digital content and Intel Teach training into Zimbabwean schools — running 21st-century learning workshops in computer labs that often had no reliable power.",
  },
  {
    period: "2012 – 2013",
    place: "Harare, Zimbabwe",
    title: "Teacher, St John's College",
    detail:
      "Geography, IT and History for Forms 1–3, plus cricket, field hockey and the Grade 8 outdoor education camp. My first view of assessment from the other side of the desk.",
  },
  {
    period: "2014 – 2016",
    place: "Johannesburg, South Africa",
    title: "Teacher, then Assistant Principal, St John the Baptist",
    detail:
      "Built hands-on Cambridge Checkpoint and IGCSE curriculum for students from underserved communities in Roodepoort, then moved into administration, instructional technology and campus infrastructure.",
  },
  {
    period: "2019 – 2023",
    place: "Osaka, Japan",
    title: "ICT Coordinator & Network Manager, Osaka YMCA International School",
    detail:
      "Stood up the technology for an entire new high school campus — network, CCTV, classroom tech, MDM across five operating systems — and built the behaviour and medical data reporting the school ran on.",
  },
  {
    period: "2016 – present",
    place: "Africa, remote",
    title: "Founder, Nyuchi Africa",
    detail:
      "A decade of building digital infrastructure for African communities under the Ubuntu philosophy — \"I am because we are.\" Learning, language, news, events, travel.",
  },
  {
    period: "2023 – present",
    place: "Singapore",
    title: "Technology & Innovation Coordinator, Singapore American School",
    detail:
      "Arrived through IT infrastructure and privacy & governance. Now working on how technology changes what teaching and learning can actually look like.",
  },
]

interface WorkItem {
  title: string
  description: string
  href?: string
}

const currentSchoolWork: WorkItem[] = [
  {
    title: "AI tooling for educators",
    description:
      "Introducing tools that can recall and synthesise information instantly — which is exactly what makes the assessment question urgent.",
  },
  {
    title: "The Toddle transition",
    description:
      "Moving how we plan, document and report on learning, which means deciding what is worth capturing in the first place.",
  },
  {
    title: "Educator Eval",
    description: "A platform for evaluation and growth conversations across the faculty.",
    href: "https://github.com/SAS-Technology-Innovation/EducatorEval",
  },
  {
    title: "Digital Toolkit & Knowledge Base",
    description: "Shared tools and a single place for institutional knowledge to live.",
    href: "https://github.com/SAS-Technology-Innovation/digital-toolkit",
  },
  {
    title: "Privacy & governance",
    description:
      "The groundwork before any of this: student data handled properly, systems that hold up to scrutiny.",
  },
]

const currentNyuchiWork: WorkItem[] = [
  {
    title: "Nyuchi Learning",
    description: "Open-source K–12 digital transformation frameworks, built for African schools.",
    href: "https://learning.nyuchi.com",
  },
  {
    title: "Nyuchi Lingo",
    description: "A language learning platform for African languages.",
    href: "https://lingo.nyuchi.com",
  },
  {
    title: "Mukoko",
    description: "A privacy-focused social platform — identity, clips, pulse, connect, novels and events.",
    href: "https://mukoko.com",
  },
  {
    title: "Mukoko News",
    description: "Pan-African news aggregated from trusted regional sources.",
    href: "https://news.mukoko.com",
  },
  {
    title: "Nhimbe",
    description: "Community events and gatherings — named for the Shona tradition of working a field together.",
    href: "https://nhimbe.com",
  },
  {
    title: "Zimbabwe Travel Info",
    description: "A practical, comprehensive travel guide to the country I come from.",
    href: "https://travel-info.co.zw",
  },
]

const aptitudes = [
  { name: "Design", detail: "Combining utility and significance — thinking like a designer." },
  { name: "Story", detail: "Putting facts in context and delivering them with emotional impact." },
  { name: "Symphony", detail: "Combining disparate pieces into a whole greater than the sum of its parts." },
  { name: "Empathy", detail: "Seeing with others' eyes, hearing with others' ears, feeling with others' hearts." },
  { name: "Play", detail: "Not only a source of joy, but a pathway to creativity and inspiration." },
  { name: "Meaning", detail: "The pursuit of significance in a world of increasing material well-being." },
]

const questions = [
  {
    title: "Different perspectives",
    body:
      "What might we discover about how different minds demonstrate understanding? How do cultural backgrounds shape what we recognise as intelligence?",
  },
  {
    title: "Cultural lens",
    body:
      "How do different backgrounds shape what we see as \"intelligence\"? What valuable ways of knowing might we be overlooking entirely?",
  },
  {
    title: "Hidden barriers",
    body:
      "Could our assessment methods create unintended barriers? Are there brilliant minds we filter out before we ever recognise their potential?",
  },
  {
    title: "Strategic alignment",
    body:
      "How might we capture our seven capabilities more fully through the tools we already have? What can we measure that we currently don't?",
  },
]

export default function OriginsWithPerspectivePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalNav />

      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        {/* Hero */}
        <section className="space-y-6 mb-16" aria-labelledby="page-title">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Talk</Badge>
            <Badge variant="outline">Equity &amp; Assessment</Badge>
            <Badge variant="outline">Singapore American School</Badge>
          </div>

          <h1 id="page-title" className="text-4xl sm:text-5xl font-light text-balance">
            Origins with a Perspective on Human Potential
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Equity: the assumptions we make in learning. A talk about where I came from, where
            education itself began, and the gap between what we say we value and what we actually
            measure.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="touch" asChild>
              <Link href={PRESENTATION_URL} target="_blank" rel="noopener noreferrer">
                Open the presentation
              </Link>
            </Button>
            <Button variant="outline" size="touch" asChild>
              <Link href="#context">Read the context</Link>
            </Button>
          </div>
        </section>

        {/* Why this exists */}
        <section id="context" className="mb-16 scroll-mt-24" aria-labelledby="context-heading">
          <h2 id="context-heading" className="text-2xl sm:text-3xl font-light mb-6">
            Why I gave this talk
          </h2>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              I work in technology at an international school. Most of my colleagues know me as the
              person who fixes things, rolls out systems, and lately introduces AI tools. That is a
              fair description of the job. It is not a complete description of the lens I bring to
              it.
            </p>
            <p>
              I am from Zimbabwe — for a long stretch, the only person on my team who is a citizen of
              a country outside the first world. Growing up there in the nineties and two-thousands
              taught me something that has never left me:{" "}
              <span className="text-foreground">
                skills meant survival and success, not grades or the name of a good school.
              </span>{" "}
              When infrastructure fails on a schedule, when the problems in front of you are not in
              any textbook, when innovation is the difference between thriving and merely getting
              by, you end up with a different working definition of intelligence.
            </p>
            <p>
              So when our school turned its equity lens on the assumptions we make about students, I
              wanted to bring that definition into the room. Not as a critique — as a question I
              genuinely cannot answer alone.
            </p>
          </div>
        </section>

        {/* The argument */}
        <section className="mb-16" aria-labelledby="argument-heading">
          <h2 id="argument-heading" className="text-2xl sm:text-3xl font-light mb-6">
            Capability over credentials
          </h2>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              In Zimbabwe, you succeeded on what you could actually do — adapt, collaborate, solve
              the unexpected — rather than by following the well-lit path of good grades to good
              college to good job. Capability mattered more than credentials, because credentials
              alone did not keep the lights on.
            </p>
            <p>
              That made me curious about education&apos;s own origins. The great centres of learning,
              from Alexandria to the Renaissance academies, evaluated scholars on their ability to
              contribute new knowledge, argue well, and solve genuinely hard problems. Not on
              recall under artificial time pressure.
            </p>
          </div>

          <blockquote className="mt-8 border-l-2 border-foreground/30 pl-6 py-1">
            <p className="text-lg sm:text-xl font-light text-foreground text-balance">
              When did we shift from cultivating intellectual excellence to measuring test-taking
              ability?
            </p>
          </blockquote>

          <p className="mt-8 text-muted-foreground leading-relaxed">
            Here is the tension I keep running into in my own work: I am helping introduce
            technologies that handle information recall instantly, while we still often assess
            students on their ability to memorise information under time pressure. Both things are
            true at once, and I do not think we have fully reckoned with that.
          </p>
        </section>

        {/* What I've done */}
        <section className="mb-16" aria-labelledby="path-heading">
          <h2 id="path-heading" className="text-2xl sm:text-3xl font-light mb-3">
            How I got here
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Zimbabwe to South Africa to Japan to Singapore. Classroom to server room to strategy —
            which is why I keep asking questions that sit awkwardly between all three.
          </p>

          <ol className="space-y-8">
            {path.map((item) => (
              <li key={`${item.title}-${item.period}`} className="relative pl-8 border-l-2 border-border pb-2">
                <div
                  className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-background border-2 border-foreground"
                  aria-hidden="true"
                />
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <div className="text-sm text-muted-foreground sm:text-right whitespace-nowrap">
                    {item.period} · {item.place}
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">{item.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What I'm doing now */}
        <section className="mb-16" aria-labelledby="now-heading">
          <h2 id="now-heading" className="text-2xl sm:text-3xl font-light mb-3">
            What I&apos;m working on now
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Two halves of the same question — one inside a school, one across a continent.
          </p>

          <div className="space-y-10">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground font-mono">
                SINGAPORE AMERICAN SCHOOL
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {currentSchoolWork.map((item) => (
                  <li key={item.title} className="p-5 border border-border rounded-lg">
                    <h4 className="font-medium mb-1">
                      {item.href ? (
                        <Link
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-muted-foreground transition-colors"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground font-mono">
                NYUCHI AFRICA ECOSYSTEM
              </h3>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Nyuchi means &quot;bee&quot; — small, collective, relentless. Everything here is built on
                Ubuntu: I am because we are.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {currentNyuchiWork.map((item) => (
                  <li key={item.title} className="p-5 border border-border rounded-lg">
                    <h4 className="font-medium mb-1">
                      {item.href ? (
                        <Link
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-muted-foreground transition-colors"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Conceptual Age */}
        <section className="mb-16" aria-labelledby="conceptual-heading">
          <h2 id="conceptual-heading" className="text-2xl sm:text-3xl font-light mb-6">
            The Conceptual Age
          </h2>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              Daniel Pink&apos;s{" "}
              <Link
                href="https://www.danpink.com/books/whole-new-mind/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
              >
                A Whole New Mind
              </Link>{" "}
              argues that abundance, automation and Asia have moved the premium away from logical,
              linear, spreadsheet work and toward what he calls high concept and high touch — the
              abilities that are hard to outsource and hard to automate.
            </p>
            <p>
              What struck me reading it is that these are the skills that drove success in Zimbabwe
              out of necessity. The Conceptual Age is not a forecast for me. It is a description of
              where I grew up.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {aptitudes.map((aptitude) => (
              <li key={aptitude.name} className="p-5 border border-border rounded-lg">
                <h3 className="font-medium mb-1">{aptitude.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{aptitude.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Questions */}
        <section className="mb-16" aria-labelledby="questions-heading">
          <h2 id="questions-heading" className="text-2xl sm:text-3xl font-light mb-3">
            The questions that matter
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            I don&apos;t have answers — just questions from someone seeing the work through a different
            lens.
          </p>

          <ul className="grid gap-4 sm:grid-cols-2">
            {questions.map((question) => (
              <li key={question.title} className="p-6 border border-border rounded-lg">
                <h3 className="font-medium mb-2">{question.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{question.body}</p>
              </li>
            ))}
          </ul>

          <blockquote className="mt-10 border-l-2 border-foreground/30 pl-6 py-1">
            <p className="text-lg sm:text-xl font-light text-foreground text-balance">
              Are there brilliant minds we&apos;re missing because we&apos;re measuring the wrong things?
            </p>
          </blockquote>
        </section>

        {/* Presentation embed */}
        <section className="mb-16" aria-labelledby="presentation-heading">
          <h2 id="presentation-heading" className="text-2xl sm:text-3xl font-light mb-3">
            The presentation
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl">
            The original scrolling deck, as it was delivered. It reads best full screen.
          </p>

          <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
            <iframe
              src={PRESENTATION_URL}
              title="Origins with a Perspective on Human Potential — presentation"
              loading="lazy"
              className="w-full h-[70vh] min-h-[480px] border-0"
            />
          </div>

          <div className="mt-4">
            <Button variant="outline" size="touch" asChild>
              <Link href={PRESENTATION_URL} target="_blank" rel="noopener noreferrer">
                Open full screen
              </Link>
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="pt-8 border-t border-border text-center" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="text-2xl font-light mb-4">
            What have you noticed?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            If you work in education, assessment, or anywhere the gap between capability and
            credentials shows up — I&apos;d like to hear how it looks from where you sit.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="touch" asChild>
              <Link href="/book">Book a Call</Link>
            </Button>
            <Button variant="outline" size="touch" asChild>
              <Link href="mailto:bryan@nyuchi.com">bryan@nyuchi.com</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Bryan Fawcett. All rights reserved.</p>
          <nav className="flex gap-4" aria-label="Footer navigation">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
            >
              Profile
            </Link>
            <Link
              href="/experience"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
            >
              Experience
            </Link>
            <Link
              href="/book"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
            >
              Book a Call
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
