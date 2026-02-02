"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChurchEvent, Profile } from "@/lib/types"
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
import { 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Calendar, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock
} from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from "date-fns"

interface EventsCalendarProps {
  events: (ChurchEvent & { creator: Pick<Profile, 'id' | 'full_name' | 'role'> | null })[]
  currentUserId: string
  canManage: boolean
}

const eventTypeColors: Record<ChurchEvent['event_type'], string> = {
  mass: "bg-purple-100 text-purple-800 border-purple-200",
  confession: "bg-blue-100 text-blue-800 border-blue-200",
  baptism: "bg-cyan-100 text-cyan-800 border-cyan-200",
  wedding: "bg-pink-100 text-pink-800 border-pink-200",
  funeral: "bg-gray-100 text-gray-800 border-gray-200",
  meeting: "bg-yellow-100 text-yellow-800 border-yellow-200",
  other: "bg-green-100 text-green-800 border-green-200",
}

const eventTypeLabels: Record<ChurchEvent['event_type'], string> = {
  mass: "Mass",
  confession: "Confession",
  baptism: "Baptism",
  wedding: "Wedding",
  funeral: "Funeral",
  meeting: "Meeting",
  other: "Other",
}

type EventType = ChurchEvent['event_type']

export function EventsCalendar({ events, currentUserId, canManage }: EventsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<ChurchEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventType, setEventType] = useState<EventType>("mass")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [location, setLocation] = useState("")

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>()
    events.forEach(event => {
      const dateKey = format(parseISO(event.start_time), "yyyy-MM-dd")
      const existing = map.get(dateKey) || []
      map.set(dateKey, [...existing, event])
    })
    return map
  }, [events])

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, "yyyy-MM-dd")
    return eventsByDate.get(dateKey) || []
  }, [selectedDate, eventsByDate])

  function resetForm() {
    setTitle("")
    setDescription("")
    setEventType("mass")
    setStartTime("")
    setEndTime("")
    setLocation("")
  }

  function openCreateDialog(date?: Date) {
    resetForm()
    if (date) {
      setStartTime(format(date, "yyyy-MM-dd") + "T09:00")
    }
    setIsCreating(true)
  }

  function openEditDialog(event: ChurchEvent) {
    setEditingEvent(event)
    setTitle(event.title)
    setDescription(event.description || "")
    setEventType(event.event_type)
    setStartTime(format(parseISO(event.start_time), "yyyy-MM-dd'T'HH:mm"))
    setEndTime(event.end_time ? format(parseISO(event.end_time), "yyyy-MM-dd'T'HH:mm") : "")
    setLocation(event.location || "")
  }

  async function handleCreate() {
    if (!title.trim() || !startTime) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("events").insert({
      title: title.trim(),
      description: description.trim() || null,
      event_type: eventType,
      start_time: new Date(startTime).toISOString(),
      end_time: endTime ? new Date(endTime).toISOString() : null,
      location: location.trim() || null,
      created_by: currentUserId,
    })

    if (!error) {
      resetForm()
      setIsCreating(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleUpdate() {
    if (!editingEvent || !title.trim() || !startTime) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("events")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        event_type: eventType,
        start_time: new Date(startTime).toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : null,
        location: location.trim() || null,
      })
      .eq("id", editingEvent.id)

    if (!error) {
      resetForm()
      setEditingEvent(null)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!deletingEvent) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", deletingEvent.id)

    if (!error) {
      setDeletingEvent(null)
      router.refresh()
    }
    setLoading(false)
  }

  const EventForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event details..."
          rows={2}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Event Type</Label>
        <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(eventTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="endTime">End Time (optional)</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Main Church, Parish Hall"
        />
      </div>
      <DialogFooter className="mt-2">
        <Button 
          variant="outline" 
          onClick={() => {
            resetForm()
            setIsCreating(false)
            setEditingEvent(null)
          }}
        >
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={loading || !title.trim() || !startTime}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
        </Button>
      </DialogFooter>
    </div>
  )

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif">
                  {format(currentMonth, "MMMM yyyy")}
                </CardTitle>
                <CardDescription>Click a date to view events</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {/* Empty cells for days before the first of the month */}
              {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}
              {daysInMonth.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd")
                const dayEvents = eventsByDate.get(dateKey) || []
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const today = isToday(day)
                
                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative p-2 min-h-[80px] text-left rounded-lg border transition-colors
                      ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-accent'}
                      ${today ? 'ring-2 ring-primary ring-offset-2' : ''}
                      ${!isSameMonth(day, currentMonth) ? 'text-muted-foreground' : ''}
                    `}
                  >
                    <span className={`text-sm font-medium ${today ? 'text-primary' : ''}`}>
                      {format(day, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="mt-1 flex flex-col gap-0.5">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-[10px] px-1 py-0.5 rounded truncate ${eventTypeColors[event.event_type]}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{dayEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-lg">
                  {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Select a Date"}
                </CardTitle>
                <CardDescription>
                  {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              {canManage && selectedDate && (
                <Button size="sm" onClick={() => openCreateDialog(selectedDate)}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="flex flex-col gap-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${eventTypeColors[event.event_type]}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {eventTypeLabels[event.event_type]}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        {event.description && (
                          <p className="text-xs mt-1 opacity-80">{event.description}</p>
                        )}
                        <div className="flex flex-col gap-1 mt-2 text-xs opacity-80">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(event.start_time), "h:mm a")}
                            {event.end_time && ` - ${format(parseISO(event.end_time), "h:mm a")}`}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(event)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingEvent(event)}
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
                ))}
              </div>
            ) : selectedDate ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No events on this date</p>
                {canManage && (
                  <Button size="sm" className="mt-3" onClick={() => openCreateDialog(selectedDate)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Event
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Select a date to view events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription>
              Add a new event to the parish calendar.
            </DialogDescription>
          </DialogHeader>
          <EventForm onSubmit={handleCreate} submitLabel="Create Event" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => { setEditingEvent(null); resetForm() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update this event.
            </DialogDescription>
          </DialogHeader>
          <EventForm onSubmit={handleUpdate} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingEvent} onOpenChange={() => setDeletingEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingEvent?.title}&quot;? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingEvent(null)}>
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
