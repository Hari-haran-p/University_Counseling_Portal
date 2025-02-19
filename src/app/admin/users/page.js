"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, X, Eye, EditIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingUserId, setEditingUserId] = useState(null)
  const [editedUserData, setEditedUserData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [viewingUser, setViewingUser] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get("/api/admin/users")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      alert("Failed to load user data.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (userId) => {
    setEditingUserId(userId)
    const userToEdit = users.find((user) => user.user_id === userId)
    setEditedUserData(userToEdit)
    setIsSidebarOpen(true)
  }

  const handleView = (user) => {
    setViewingUser(user)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await axios.put(`/api/admin/users/${editingUserId}`, editedUserData)
      alert("User data updated successfully!")
      setEditingUserId(null)
      setIsSidebarOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Error updating user data:", error)
      alert("Failed to update user data.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingUserId(null)
    setIsSidebarOpen(false)
  }

  const columnNames = ["user_id", "username", "role", "name", "email", "mobno"]

  const allColumnNames = [
    "user_id",
    "username",
    "role",
    "name",
    "mobno",
    "email",
    "dob",
    "gender",
    "religion",
    "community",
    "mother_tongue",
    "native_state",
    "parent_name",
    "parent_mobno",
    "personal_pincode",
    "personal_state",
    "personal_district",
    "address1",
    "address2",
    "personal_city",
    "board_name",
    "school_name",
    "medium",
    "educational_pincode",
    "educational_state",
    "educational_district",
    "educational_address",
    "educational_city",
    "month_passout",
    "year_passout",
  ]

  const formatColumnHeader = (header) => {
    const words = header.split("_")
    const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    return capitalizedWords.join(" ")
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin - User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Loading user data...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columnNames.map((column) => (
                      <TableHead key={column}>{formatColumnHeader(column)}</TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id}>
                      {columnNames.map((column) => (
                        <TableCell key={`${user.user_id}-${column}`}>{user[column]}</TableCell>
                      ))}
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => handleView(user)}>
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {allColumnNames.map((column) => (
                                  <div key={column} className="space-y-1">
                                    <Label className="font-medium">{formatColumnHeader(column)}</Label>
                                    <p>{user[column]}</p>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" className="bg-primary-800" onClick={() => handleEdit(user.user_id)}>
                            <EditIcon className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 w-full sm:w-[400px] h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50",
          isSidebarOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Edit User</h2>
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-80px)] p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
            className="space-y-4"
          >
            {allColumnNames.map((column) => (
              <div key={column} className="space-y-2">
                <Label htmlFor={column}>{formatColumnHeader(column)}</Label>
                <Input id={column} name={column} value={editedUserData[column] || ""} onChange={handleInputChange} />
              </div>
            ))}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </form>
        </ScrollArea>
      </div>
    </div>
  )
}

export default AdminUsersPage

