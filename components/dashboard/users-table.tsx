"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Profile, UserRole, ROLE_LABELS } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MoreHorizontal, Pencil, Trash2, Users, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface UsersTableProps {
  users: Profile[]
  currentUserId: string
}

const roleColors: Record<UserRole, string> = {
  priest: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  employee: "bg-green-100 text-green-800",
  sacristan: "bg-orange-100 text-orange-800",
  parent: "bg-gray-100 text-gray-800",
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [search, setSearch] = useState("")
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [deletingUser, setDeletingUser] = useState<Profile | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>("employee")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      ROLE_LABELS[user.role].toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  async function handleUpdateRole() {
    if (!editingUser) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ role: selectedRole })
      .eq("id", editingUser.id)

    if (!error) {
      router.refresh()
    }
    
    setLoading(false)
    setEditingUser(null)
  }

  async function handleDeleteUser() {
    if (!deletingUser) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", deletingUser.id)

    if (!error) {
      router.refresh()
    }
    
    setLoading(false)
    setDeletingUser(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-serif">Team Members</CardTitle>
              <CardDescription>{users.length} registered users</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {user.full_name || "Unnamed User"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={roleColors[user.role]}>
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.phone || "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {user.id !== currentUserId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingUser(user)
                                  setSelectedRole(user.role)
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingUser(user)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {search ? "No users found matching your search" : "No users yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {editingUser?.full_name || editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {deletingUser?.full_name || deletingUser?.email}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
