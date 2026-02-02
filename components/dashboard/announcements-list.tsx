"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Announcement, Profile, UserRole, ROLE_LABELS } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Megaphone, 
  Loader2,
  AlertCircle 
} from "lucide-react"
import { format } from "date-fns"

interface AnnouncementsListProps {
  announcements: (Announcement & { author: Pick<Profile, 'id' | 'full_name' | 'role'> | null })[]
  currentUserId: string
  canManage: boolean
  userRole: UserRole
}

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

const priorityIcons = {
  low: null,
  normal: null,
  high: AlertCircle,
  urgent: AlertCircle,
}

const roles: UserRole[] = ['priest', 'admin', 'employee', 'sacristan', 'parent']

export function AnnouncementsList({ 
  announcements, 
  currentUserId, 
  canManage,
  userRole 
}: AnnouncementsListProps) {
  const [search, setSearch] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState<Announcement['priority']>("normal")
  const [visibleTo, setVisibleTo] = useState<UserRole[]>(roles)

  const filteredAnnouncements = announcements
    .filter(a => a.visible_to.includes(userRole) || a.author_id === currentUserId)
    .filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
    )

  function resetForm() {
    setTitle("")
    setContent("")
    setPriority("normal")
    setVisibleTo(roles)
  }

  function openEditDialog(announcement: Announcement) {
    setEditingAnnouncement(announcement)
    setTitle(announcement.title)
    setContent(announcement.content)
    setPriority(announcement.priority)
    setVisibleTo(announcement.visible_to)
  }

  async function handleCreate() {
    if (!title.trim() || !content.trim()) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("announcements").insert({
      title: title.trim(),
      content: content.trim(),
      priority,
      visible_to: visibleTo,
      author_id: currentUserId,
    })

    if (!error) {
      resetForm()
      setIsCreating(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleUpdate() {
    if (!editingAnnouncement || !title.trim() || !content.trim()) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("announcements")
      .update({
        title: title.trim(),
        content: content.trim(),
        priority,
        visible_to: visibleTo,
      })
      .eq("id", editingAnnouncement.id)

    if (!error) {
      resetForm()
      setEditingAnnouncement(null)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!deletingAnnouncement) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", deletingAnnouncement.id)

    if (!error) {
      setDeletingAnnouncement(null)
      router.refresh()
    }
    setLoading(false)
  }

  function toggleRole(role: UserRole) {
    setVisibleTo(prev =>
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    )
  }

  const AnnouncementForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement title"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your announcement..."
          rows={4}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Priority</Label>
        <Select value={priority} onValueChange={(v) => setPriority(v as Announcement['priority'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Visible To</Label>
        <div className="flex flex-wrap gap-3">
          {roles.map((role) => (
            <div key={role} className="flex items-center gap-2">
              <Checkbox
                id={`role-${role}`}
                checked={visibleTo.includes(role)}
                onCheckedChange={() => toggleRole(role)}
              />
              <Label htmlFor={`role-${role}`} className="text-sm font-normal cursor-pointer">
                {ROLE_LABELS[role]}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <DialogFooter className="mt-2">
        <Button 
          variant="outline" 
          onClick={() => {
            resetForm()
            setIsCreating(false)
            setEditingAnnouncement(null)
          }}
        >
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={loading || !title.trim() || !content.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
        </Button>
      </DialogFooter>
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-serif">All Announcements</CardTitle>
              <CardDescription>{filteredAnnouncements.length} announcements</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search announcements..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {canManage && (
                <Dialog open={isCreating} onOpenChange={setIsCreating}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetForm()}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Announcement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create Announcement</DialogTitle>
                      <DialogDescription>
                        Share important news with the parish community.
                      </DialogDescription>
                    </DialogHeader>
                    <AnnouncementForm onSubmit={handleCreate} submitLabel="Create Announcement" />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAnnouncements.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredAnnouncements.map((announcement) => {
                const PriorityIcon = priorityIcons[announcement.priority]
                return (
                  <div
                    key={announcement.id}
                    className="flex flex-col gap-3 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                          <Badge variant="secondary" className={priorityColors[announcement.priority]}>
                            {PriorityIcon && <PriorityIcon className="h-3 w-3 mr-1" />}
                            {announcement.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>By {announcement.author?.full_name || "Unknown"}</span>
                          <span>{format(new Date(announcement.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {announcement.visible_to.map((role) => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {ROLE_LABELS[role]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(announcement)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingAnnouncement(announcement)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Megaphone className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {search ? "No announcements found matching your search" : "No announcements yet"}
              </p>
              {canManage && !search && (
                <Button className="mt-4" onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Announcement
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingAnnouncement} onOpenChange={() => { setEditingAnnouncement(null); resetForm() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>
              Update this announcement.
            </DialogDescription>
          </DialogHeader>
          <AnnouncementForm onSubmit={handleUpdate} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingAnnouncement} onOpenChange={() => setDeletingAnnouncement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingAnnouncement?.title}&quot;? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingAnnouncement(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
