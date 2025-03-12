"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Loader2, X, Eye, EditIcon, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUserData, setEditedUserData] = useState({});
  const [originalUserData, setOriginalUserData] = useState({}); // Store original user data
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page

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
      toast.error("Failed to load user data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (userId) => {
    setEditingUserId(userId);
    const userToEdit = users.find((user) => user.user_id === userId);
    setEditedUserData(userToEdit);
    setOriginalUserData(userToEdit); // Store the original data
    setIsSidebarOpen(true);
  };

  const handleView = (user) => {
    setViewingUser(user);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Check if any changes were made
    const hasChanges =
      JSON.stringify(editedUserData) !== JSON.stringify(originalUserData);

    if (!hasChanges) {
      toast.info("No changes were made.");
      setIsSaving(false);
      setIsSidebarOpen(false);
      return;
    }

    try {
      await axios.put(`/api/admin/users/${editingUserId}`, editedUserData);
      toast.success("User data updated successfully!"); // Show success message as toast
      setEditingUserId(null);
      setIsSidebarOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Failed to update user data."); // Show error message as toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setIsSidebarOpen(false);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.trim());
    setCurrentPage(1); // Reset page on new search
  };

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(parseInt(value, 10));
    setCurrentPage(1); // Reset page on rows per page change
  };

  const columnNames = ["user_id", "username", "role", "name", "email", "mobno"];

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
    "educational_address",
    "month_passout",
    "year_passout",
  ];

  const formatColumnHeader = (header) => {
    const words = header.split("_");
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );
    return capitalizedWords.join(" ");
  };

  const sortedAndFilteredUsers = useMemo(() => {
    let filtered = users;
    if (searchQuery) {
      filtered = users.filter((user) => {
        return allColumnNames.some((column) => {
          const value = user[column];
          if (value) {
            return String(value)
              .toLowerCase()
              .trim() // Add trim() here
              .includes(searchQuery.toLowerCase());
          }
          return false;
        });
      });
    }

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === null || aValue === undefined) return -1;
        if (bValue === null || bValue === undefined) return 1;

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();

        return sortDirection === "asc"
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      });
    }

    return filtered;
  }, [users, searchQuery, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedAndFilteredUsers.length / rowsPerPage);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return sortedAndFilteredUsers.slice(startIndex, endIndex);
  }, [sortedAndFilteredUsers, currentPage, rowsPerPage]);

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Admin - User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-1/3"
            />
            <Select
              onValueChange={handleRowsPerPageChange}
              defaultValue={String(rowsPerPage)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Rows per Page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Rows</SelectItem>
                <SelectItem value="10">10 Rows</SelectItem>
                <SelectItem value="20">20 Rows</SelectItem>
                <SelectItem value="50">50 Rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                      <TableHead
                        key={column}
                        onClick={() => handleSort(column)}
                        className="cursor-pointer whitespace-nowrap"
                      >
                        {formatColumnHeader(column)}
                        {sortColumn === column && (
                          <>
                            {sortDirection === "asc" ? (
                              <ArrowUp className="inline-block ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="inline-block ml-1 h-4 w-4" />
                            )}
                          </>
                        )}
                      </TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      {columnNames.map((column) => (
                        <TableCell
                          key={`${user.user_id}-${column}`}
                          className="whitespace-nowrap"
                        >
                          {user[column]}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleView(user)}
                              >
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {allColumnNames.map((column) => {
                                  if (column != "dob") {
                                    return (
                                      <div key={column} className="space-y-1">
                                        <Label className="font-medium">
                                          {formatColumnHeader(column)}
                                        </Label>
                                        <p>{user[column]}</p>
                                      </div>
                                    )
                                  }
                                  return (
                                    <div key={column} className="space-y-1">
                                      <Label className="font-medium">
                                        {formatColumnHeader(column)}
                                      </Label>
                                      <p>{user[column]?.split("T")[0]}</p>
                                    </div>
                                  )
                                })}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            className="bg-primary-800"
                            onClick={() => handleEdit(user.user_id)}
                          >
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
          <div className="flex justify-between items-center mt-4">
            <span>
              Showing page {currentPage} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 w-full sm:w-[400px] h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50",
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
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
              e.preventDefault();
              handleSave();
            }}
            className="space-y-4"
          >
            {allColumnNames.map((column) => (
              <div key={column} className="space-y-2">
                <Label htmlFor={column}>{formatColumnHeader(column)}</Label>
                <Input
                  id={column}
                  name={column}
                  value={editedUserData[column] || ""}
                  onChange={handleInputChange}
                />
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
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminUsersPage;