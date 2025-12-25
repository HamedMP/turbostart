import { createFileRoute, Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Rocket01Icon,
  SourceCodeIcon,
  Database01Icon,
  Video01Icon,
  TelegramIcon,
  FlashIcon,
  ServerStack01Icon,
  LinkSquare02Icon,
  PlusSignIcon,
  GithubIcon,
} from '@hugeicons/core-free-icons'

export const Route = createFileRoute('/')({
  component: Home,
})

const GITHUB_URL = 'https://github.com/HamedMP/turbostart'

function TechBadge({
  name,
  href,
  icon,
}: {
  name: string
  href: string
  icon?: typeof Rocket01Icon
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
    >
      {icon && <HugeiconsIcon icon={icon} className="w-4 h-4" />}
      {name}
      <HugeiconsIcon icon={LinkSquare02Icon} className="w-3 h-3 opacity-50" />
    </a>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  optional = false,
}: {
  icon: typeof Rocket01Icon
  title: string
  description: string
  optional?: boolean
}) {
  return (
    <div className={`rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow ${optional ? 'opacity-80' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <HugeiconsIcon icon={icon} className="w-6 h-6 text-primary" />
        </div>
        {optional && (
          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium">
            Optional
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}

function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 opacity-0 animate-fade-in-up">
            turbostart
          </h1>
          <p className="text-xl text-muted-foreground mb-8 opacity-0 animate-fade-in-up delay-100">
            A production-ready monorepo with modern React frontend and blazing-fast Bun backend.
          </p>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 opacity-0 animate-fade-in-up delay-200">
            <TechBadge name="TanStack Start" href="https://tanstack.com/start" icon={FlashIcon} />
            <TechBadge name="React 19" href="https://react.dev" icon={SourceCodeIcon} />
            <TechBadge name="Bun" href="https://bun.sh" icon={Rocket01Icon} />
            <TechBadge name="Hono" href="https://hono.dev" icon={ServerStack01Icon} />
            <TechBadge name="Drizzle" href="https://orm.drizzle.team" icon={Database01Icon} />
            <TechBadge name="Tailwind CSS" href="https://tailwindcss.com" />
          </div>

          <div className="flex gap-4 justify-center opacity-0 animate-fade-in-up delay-300">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <HugeiconsIcon icon={GithubIcon} className="w-5 h-5" />
              View on GitHub
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/10 transition-colors"
            >
              <HugeiconsIcon icon={Rocket01Icon} className="w-5 h-5" />
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Core Stack
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Everything you need to build full-stack applications with type safety and great DX.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon={FlashIcon}
              title="TanStack Start Frontend"
              description="Server-side rendered React 19 with TanStack Router, TanStack Query, and Tailwind CSS 4. Full TypeScript support with blazing-fast HMR."
            />
            <FeatureCard
              icon={ServerStack01Icon}
              title="Bun + Hono Backend"
              description="Lightning-fast API server with Hono framework, Drizzle ORM for type-safe database access, and PostgreSQL. Built for performance."
            />
          </div>
        </div>
      </section>

      {/* Optional Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HugeiconsIcon icon={PlusSignIcon} className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-3xl font-bold text-center">
              Optional Add-ons
            </h2>
          </div>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Enable additional features via Docker Compose profiles when you need them.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FeatureCard
              icon={TelegramIcon}
              title="Telegram Bot"
              description="Grammy-based bot with commands, inline keyboards, rate limiting, and session management. Start with: docker-compose --profile bot up"
              optional
            />
            <FeatureCard
              icon={Video01Icon}
              title="Remotion Video"
              description="Programmatic video generation for social media content. Create dynamic videos with React components. Start with: docker-compose --profile video up"
              optional
            />
          </div>
        </div>
      </section>

      {/* Full Tech Stack */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Full Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Turborepo',
              'pnpm',
              'TypeScript',
              'Bun',
              'Hono',
              'Drizzle ORM',
              'PostgreSQL',
              'React 19',
              'TanStack Start',
              'TanStack Router',
              'TanStack Query',
              'Tailwind CSS 4',
              'shadcn/ui',
              't3-env',
              'Docker',
              'PostHog',
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-background rounded-full text-sm font-medium border border-border"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground text-sm">
          <p>
            Built with{' '}
            <a href={GITHUB_URL} className="underline hover:text-foreground">
              turbostart
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}
