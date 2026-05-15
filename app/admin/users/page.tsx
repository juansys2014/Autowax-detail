"use client"

import { Plus, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const users = [
  { id: 1, name: "Admin User", email: "admin@autowaxsfl.com", role: "Admin", lastActive: "Just now", initials: "AD" },
  { id: 2, name: "Manager", email: "manager@autowaxsfl.com", role: "Manager", lastActive: "2 hours ago", initials: "MG" },
  { id: 3, name: "Staff Member", email: "staff@autowaxsfl.com", role: "Staff", lastActive: "1 day ago", initials: "SM" },
]

const roles = [
  { name: "Admin", description: "Full access to all features", color: "text-red-500", bgColor: "bg-red-500/10", borderColor: "border-red-500/50" },
  { name: "Manager", description: "Manage appointments, clients, and sellers", color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/50" },
  { name: "Staff", description: "View appointments and clients only", color: "text-muted-foreground", bgColor: "bg-muted", borderColor: "border-border" },
]

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Users & Permissions</h1>
          <p className="text-sm text-muted-foreground">Manage team access and roles</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Users Table */}
        <Card className="bg-[#1e1e1e] border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">Last Active</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const roleInfo = roles.find((r) => r.name === user.role)
                  return (
                    <TableRow key={user.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/20 text-primary text-sm">{user.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${roleInfo?.borderColor} ${roleInfo?.bgColor} ${roleInfo?.color}`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Roles */}
        <Card className="bg-[#1e1e1e] border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Roles</CardTitle>
            <CardDescription>Permission levels for users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {roles.map((role) => (
              <div key={role.name} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`${role.borderColor} ${role.bgColor} ${role.color}`}>
                    {role.name}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
