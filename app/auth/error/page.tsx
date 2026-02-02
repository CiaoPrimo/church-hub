import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Church, AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Church className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Church Hub
          </h1>
        </div>
      </div>

      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="font-serif text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            Something went wrong during authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            This could be due to an expired link or a technical issue. Please try again or contact your parish administrator for help.
          </p>

          <div className="flex flex-col gap-2 mt-2">
            <Button asChild>
              <Link href="/auth/login">
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
