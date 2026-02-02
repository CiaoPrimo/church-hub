"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Profile, ROLE_LABELS } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Check, User } from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
        setFullName(data.full_name || "")
        setPhone(data.phone || "")
      }
      setLoading(false)
    }

    loadProfile()
  }, [router])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
      })
      .eq("id", profile.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <Check className="h-4 w-4" />
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(fullName || profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{fullName || profile?.full_name || "Unnamed User"}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <Badge variant="secondary" className="mt-1">
                {ROLE_LABELS[profile?.role || "employee"]}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact an administrator if needed.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Role</Label>
              <Input
                value={ROLE_LABELS[profile?.role || "employee"]}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Your role is assigned by administrators.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Account</CardTitle>
          <CardDescription>Manage your account settings.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Member Since</p>
              <p className="text-sm text-muted-foreground">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </p>
            </div>
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
