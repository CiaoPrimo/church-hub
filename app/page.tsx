import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Church, Users, Megaphone, Calendar, CheckSquare, Shield, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Church className="h-5 w-5" />
            </div>
            <span className="font-serif text-xl font-semibold">Church Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 lg:py-24 bg-gradient-to-b from-background to-secondary/30">
        <div className="max-w-3xl text-center">
          <h1 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            Manage Your Parish with
            <span className="text-primary"> Grace & Efficiency</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            A comprehensive management system designed for parishes to coordinate staff, 
            share announcements, manage tasks, and organize events - all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Start Managing Your Parish
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">
                Sign In to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24 px-4 bg-background">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Everything Your Parish Needs
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Built specifically for churches and parishes, with features that make coordination effortless.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Users}
              title="Team Management"
              description="Manage priests, staff, sacristans, and volunteers with role-based permissions."
            />
            <FeatureCard
              icon={Megaphone}
              title="Announcements"
              description="Share important updates with specific groups or the entire parish community."
            />
            <FeatureCard
              icon={CheckSquare}
              title="Task Tracking"
              description="Assign and track tasks to ensure nothing falls through the cracks."
            />
            <FeatureCard
              icon={Calendar}
              title="Event Scheduling"
              description="Organize masses, confessions, baptisms, weddings, and all parish events."
            />
            <FeatureCard
              icon={Shield}
              title="Role-Based Access"
              description="Control who can view and manage different aspects of parish operations."
            />
            <FeatureCard
              icon={Church}
              title="Built for Churches"
              description="Designed with the unique needs of parishes and religious organizations in mind."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-bold">
            Ready to Transform Your Parish Management?
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Join parishes already using Church Hub to streamline their operations.
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link href="/auth/sign-up">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-background">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Church className="h-5 w-5 text-primary" />
            <span className="font-serif font-semibold">Church Hub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with faith for parishes worldwide.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
