// app/admin/users/page.js
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUserData, setEditedUserData] = useState({});
  const [isSaving, setIsSaving] = useState(false); // New state for saving

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load user data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (userId) => {
    setEditingUserId(userId);
    const userToEdit = users.find((user) => user.user_id === userId);
    setEditedUserData(userToEdit);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData({ ...editedUserData, [name]: value });
  };

  const handleSave = async () => {
    setIsSaving(true); // Disable button and show loading
    try {
      await axios.put(`/api/admin/users/${editingUserId}`, editedUserData);
      alert("User data updated successfully!");
      setEditingUserId(null);
      fetchUsers(); // Refresh user data after saving
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update user data.");
    } finally {
      setIsSaving(false); // Enable button and hide loading
    }
  };

  const handleCancel = () => {
    setEditingUserId(null);
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.user_id}</TableCell>
                    <TableCell>
                      {editingUserId === user.user_id ? (
                        <Input
                          type="text"
                          name="username"
                          value={editedUserData.username || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        user.username
                      )}
                    </TableCell>
                    <TableCell>
                      {editingUserId === user.user_id ? (
                        <Input
                          type="text"
                          name="role"
                          value={editedUserData.role || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        user.role
                      )}
                    </TableCell>
                    <TableCell>
                      {editingUserId === user.user_id ? (
                        <Input
                          type="text"
                          name="name"
                          value={editedUserData.name || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        user.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingUserId === user.user_id ? (
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => handleEdit(user.user_id)}>
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;