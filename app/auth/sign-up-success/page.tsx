import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Church, Mail, CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="font-serif text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            {"We've sent you a confirmation link"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Please check your inbox and click the verification link to activate your account.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            {"Didn't receive an email? Check your spam folder or contact your parish administrator."}
          </p>

          <Button asChild variant="outline" className="mt-2">
            <Link href="/auth/login">
              Return to Sign In
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
