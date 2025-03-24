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
import { Loader2, X, Eye, ArrowUp, ArrowDown } from "lucide-react";
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
import { toast } from "react-fox-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const AdminApplicationPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUserData, setEditedUserData] = useState({});
  const [originalUserData, setOriginalUserData] = useState({});
  const [isSaving, setIsSaving] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const allColumnNames = [
    "user_id",
    "username",
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
    // "educational_pincode",
    // "educational_state",
    // "educational_district",
    "educational_address",
    // "educational_city",
    "month_passout",
    "year_passout",
    // "declaration",
  ];

  const tableColumns = ["user_id", "username", "name", "mobno", "email", "dob", "gender", "community"]
  // Default rows per page
  const [columnVisibility, setColumnVisibility] = useState(() => {
    const initialVisibility = {};
    allColumnNames.forEach((column) => {
      initialVisibility[column] = true;
    });
    return initialVisibility;
  });

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
    setOriginalUserData(userToEdit);
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
      toast.success("User data updated successfully!");
      setEditingUserId(null);
      setIsSidebarOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Failed to update user data.");
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
        return allColumnNames
          .filter((column) => columnVisibility[column])
          .some((column) => {
            // Only search visible columns
            const value = user[column];
            if (value) {
              return String(value)
                .toLowerCase()
                .trim()
                .includes(searchQuery.toLowerCase());
            }
            return false;
          });
      });
    }

    if (sortColumn && columnVisibility[sortColumn]) {
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
  }, [users, searchQuery, sortColumn, sortDirection, columnVisibility]);

  const totalPages = Math.ceil(sortedAndFilteredUsers.length / rowsPerPage);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return sortedAndFilteredUsers.slice(startIndex, endIndex);
  }, [sortedAndFilteredUsers, currentPage, rowsPerPage]);

  const usersToShow = useMemo(() => {
    return paginatedUsers.filter((user) => user.role === "user");
  }, [paginatedUsers]);

  // Column Visibility Handling
  const handleColumnToggle = (column) => {
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [column]: !prevVisibility[column],
    }));
  };

  // Export Functions
  const exportToPDF = () => {
    const doc = new jsPDF();
    const visibleColumns = allColumnNames.filter(
      (column) => columnVisibility[column]
    );
    const columnGroups = [];
    const columnsPerPage = 5;

    for (let i = 0; i < visibleColumns.length; i += columnsPerPage) {
      columnGroups.push(visibleColumns.slice(i, i + columnsPerPage));
    }

    columnGroups.forEach((group, groupIndex) => {
      const headers = group.map((column) => formatColumnHeader(column));
      const tableData = usersToShow.map((item) => {
        const row = [];
        group.forEach((column) => {
          row.push(item[column]);
        });
        return row;
      });

      doc.autoTable({
        head: [headers],
        body: tableData,
        startY: groupIndex === 0 ? 10 : doc.previousAutoTable.finalY + 10, // Start Y position
        margin: { horizontal: 10 },
        showHead: "everyPage",
      });

      if (groupIndex < columnGroups.length - 1) {
        doc.addPage();
      }
    });

    doc.save("user_data.pdf");
  };

  const exportToExcel = () => {
    const visibleColumns = allColumnNames.filter(
      (column) => columnVisibility[column]
    );
    const headers = visibleColumns.map((column) => formatColumnHeader(column));

    const tableData = usersToShow.map((item) => {
      const row = {};
      visibleColumns.forEach((column) => {
        row[formatColumnHeader(column)] = item[column];
      });
      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(tableData, { header: headers });

    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "user_data.xlsx");
  };


  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Admin - Application Management
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
            <div className="flex space-x-2 items-center">
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

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Select Columns</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[450px] bg-white p-6 rounded-2xl shadow-xl">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-800">
                      Select Columns to Display
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-3 py-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {allColumnNames.map((column) => {
                      return (
                        <>
                          <div
                            key={column}
                            className="flex items-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
                          >
                            <Input
                              type="checkbox"
                              id={column}
                              checked={columnVisibility[column]}
                              onChange={() => handleColumnToggle(column)}
                              className="w-5 h-5 accent-blue-600 cursor-pointer"
                            />
                            <Label
                              htmlFor={column}
                              className="ml-3 text-gray-700 font-medium cursor-pointer"
                            >
                              {formatColumnHeader(column)}
                            </Label>
                          </div>
                        </>
                      )
                    })}
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={exportToPDF}>
                Export to PDF
              </Button>
              <Button variant="outline" onClick={exportToExcel}>
                Export to Excel
              </Button>


            </div>
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
                    {allColumnNames
                      .filter((column) => columnVisibility[column])
                      .map((column) => {
                        if (tableColumns.includes(column)) {

                          return (
                            <TableHead
                              key={column}
                              onClick={() => handleSort(column)}
                              className="cursor-pointer whitespace-nowrap"
                              style={{ minWidth: "120px", width: "auto" }}
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
                          )
                        }
                      })}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersToShow.map((user) => (
                    <TableRow key={user.user_id}>
                      {allColumnNames

                        .filter((column) => columnVisibility[column])
                        .map((column) => {
                          if (tableColumns.includes(column)) {
                            if (column == 'dob') {
                              return (
                                <TableCell
                                  key={`${user.user_id}-${column}`}
                                  className="whitespace-nowrap"
                                >
                                  {user[column]?.split("T")[0]}
                                </TableCell>
                              )
                            }
                            return (
                              <TableCell
                                key={`${user.user_id}-${column}`}
                                className="whitespace-nowrap"
                              >
                                {user[column]}
                              </TableCell>
                            )
                          }
                        })}
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
                                  if (column != 'dob') {
                                    return (
                                      <div key={column} className="space-y-1">
                                        <Label className="font-semibold ">
                                          {formatColumnHeader(column)}
                                        </Label>
                                        <p>{user[column]}</p>
                                      </div>
                                    )
                                  }
                                  return (
                                    <div key={column} className="space-y-1">
                                      <Label className="font-semibold ">
                                        {formatColumnHeader(column)}
                                      </Label>
                                      <p>{user[column]?.split("T")[0]}</p>
                                    </div>
                                  )

                                })}
                              </div>
                            </DialogContent>
                          </Dialog>
                          {/* REMOVE EDIT BUTTON */}
                          {/*
                            <Button
                              size="sm"
                              className="bg-primary-800"
                              onClick={() => handleEdit(user.user_id)}
                            >
                              <EditIcon className="h-4 w-4 mr-1" /> Edit
                            </Button>
                           */}
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

export default AdminApplicationPage;