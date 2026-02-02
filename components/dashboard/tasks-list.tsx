"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Task, Profile } from "@/lib/types"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  CheckSquare, 
  Loader2,
  Clock,
  CheckCircle,
  Circle,
  XCircle,
  AlertCircle,
  User
} from "lucide-react"
import { format } from "date-fns"

interface TasksListProps {
  tasks: (Task & { 
    assignee: Pick<Profile, 'id' | 'full_name' | 'role'> | null
    creator: Pick<Profile, 'id' | 'full_name' | 'role'> | null
  })[]
  users: Pick<Profile, 'id' | 'full_name' | 'role'>[]
  currentUserId: string
  canManage: boolean
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-muted text-muted-foreground",
}

const statusIcons = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
}

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

type TaskStatus = Task['status']
type TaskPriority = Task['priority']

export function TasksList({ tasks, users, currentUserId, canManage }: TasksListProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [isCreating, setIsCreating] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("normal")
  const [status, setStatus] = useState<TaskStatus>("pending")
  const [assignedTo, setAssignedTo] = useState<string>("unassigned")
  const [dueDate, setDueDate] = useState("")

  const filteredTasks = tasks
    .filter(t => 
      statusFilter === "all" || t.status === statusFilter
    )
    .filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee?.full_name?.toLowerCase().includes(search.toLowerCase())
    )

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setPriority("normal")
    setStatus("pending")
    setAssignedTo("unassigned")
    setDueDate("")
  }

  function openEditDialog(task: Task) {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description || "")
    setPriority(task.priority)
    setStatus(task.status)
    setAssignedTo(task.assigned_to || "unassigned")
    setDueDate(task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : "")
  }

  async function handleCreate() {
    if (!title.trim()) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("tasks").insert({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status: "pending",
      assigned_to: assignedTo === "unassigned" ? null : assignedTo,
      due_date: dueDate || null,
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
    if (!editingTask || !title.trim()) return
    setLoading(true)

    const supabase = createClient()
    const updateData: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      assigned_to: assignedTo === "unassigned" ? null : assignedTo,
      due_date: dueDate || null,
    }

    if (status === "completed" && editingTask.status !== "completed") {
      updateData.completed_at = new Date().toISOString()
    } else if (status !== "completed") {
      updateData.completed_at = null
    }

    const { error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", editingTask.id)

    if (!error) {
      resetForm()
      setEditingTask(null)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!deletingTask) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", deletingTask.id)

    if (!error) {
      setDeletingTask(null)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleQuickStatusChange(task: Task, newStatus: TaskStatus) {
    const supabase = createClient()
    const updateData: Partial<Task> = { status: newStatus }
    
    if (newStatus === "completed") {
      updateData.completed_at = new Date().toISOString()
    } else {
      updateData.completed_at = null
    }

    await supabase.from("tasks").update(updateData).eq("id", task.id)
    router.refresh()
  }

  const TaskForm = ({ onSubmit, submitLabel, showStatus = false }: { 
    onSubmit: () => void
    submitLabel: string
    showStatus?: boolean 
  }) => (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task details..."
          rows={3}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
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
        {showStatus && (
          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Assign To</Label>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || "Unnamed User"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dueDate">Due Date (optional)</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter className="mt-2">
        <Button 
          variant="outline" 
          onClick={() => {
            resetForm()
            setIsCreating(false)
            setEditingTask(null)
          }}
        >
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={loading || !title.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
        </Button>
      </DialogFooter>
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="font-serif">All Tasks</CardTitle>
                <CardDescription>{filteredTasks.length} tasks</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
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
                        New Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Create Task</DialogTitle>
                        <DialogDescription>
                          Add a new task to the parish workflow.
                        </DialogDescription>
                      </DialogHeader>
                      <TaskForm onSubmit={handleCreate} submitLabel="Create Task" />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "all")}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredTasks.map((task) => {
                const StatusIcon = statusIcons[task.status]
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                  >
                    <button
                      onClick={() => handleQuickStatusChange(
                        task, 
                        task.status === 'completed' ? 'pending' : 'completed'
                      )}
                      className="mt-0.5 flex-shrink-0"
                    >
                      <StatusIcon className={`h-5 w-5 ${
                        task.status === 'completed' ? 'text-green-600' : 
                        task.status === 'in_progress' ? 'text-blue-600' : 
                        'text-muted-foreground'
                      }`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </h3>
                        <Badge variant="secondary" className={priorityColors[task.priority]}>
                          {task.priority === 'urgent' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {task.priority}
                        </Badge>
                        <Badge variant="secondary" className={statusColors[task.status]}>
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        {task.assignee ? (
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                {getInitials(task.assignee.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{task.assignee.full_name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>Unassigned</span>
                          </div>
                        )}
                        {task.due_date && (
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                            <Clock className="h-3 w-3" />
                            <span>Due {format(new Date(task.due_date), "MMM d, yyyy")}</span>
                            {isOverdue && <span className="text-red-600 font-medium">(Overdue)</span>}
                          </div>
                        )}
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
                          <DropdownMenuItem onClick={() => handleQuickStatusChange(task, 'in_progress')}>
                            <Clock className="mr-2 h-4 w-4" />
                            Mark In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickStatusChange(task, 'completed')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(task)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingTask(task)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckSquare className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {search || statusFilter !== "all" ? "No tasks found matching your filters" : "No tasks yet"}
              </p>
              {canManage && !search && statusFilter === "all" && (
                <Button className="mt-4" onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => { setEditingTask(null); resetForm() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update this task.
            </DialogDescription>
          </DialogHeader>
          <TaskForm onSubmit={handleUpdate} submitLabel="Save Changes" showStatus />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingTask?.title}&quot;? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTask(null)}>
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
