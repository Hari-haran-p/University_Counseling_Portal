// app/admin/counseling/ManageSeats.jsx
"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { icons, Loader2, Trash } from "lucide-react";
import { toast } from "react-fox-toast";
import SuccessIcon from "./ui/toast-success";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

// Custom CardHeader component
const CardHeader = ({ children }) => {
  return (
    <div className="px-4 py-2 flex justify-between items-center border-b">
      {children}
    </div>
  );
};

// Custom CardTitle component
const CardTitle = ({ children }) => {
  return (
    <h3 className="text-lg font-semibold leading-none tracking-tight">
      {children}
    </h3>
  );
};

const ManageSeats = () => {
  const [departments, setDepartments] = useState([]);
  const [seatAllocations, setSeatAllocations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [allocationRound, setAllocationRound] = useState(1);
  const [openAddDepartmentDialog, setOpenAddDepartmentDialog] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentDesc, setNewDepartmentDesc] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [departmentsResponse, seatsResponse] = await Promise.all([
        axios.get("/api/counseling/departments"),
        axios.get("/api/counseling/available-seats"),
      ]);
      setDepartments(departmentsResponse.data);

      const initialAllocations = {};
      departmentsResponse.data.forEach((department) => {
        initialAllocations[department.id] = {
          OC: 0,
          BC: 0,
          MBC: 0,
          SC: 0,
          ST: 0,
        };
      });

      seatsResponse.data.forEach((seat) => {
        if (initialAllocations[seat.department_id]) {
          initialAllocations[seat.department_id][seat.community] = seat.seats_available;
        }
      });

      setSeatAllocations(initialAllocations);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.response?.data?.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatChange = (departmentId, community, value) => {
    setSeatAllocations((prevState) => ({
      ...prevState,
      [departmentId]: {
        ...prevState[departmentId],
        [community]: parseInt(value, 10) || 0,
      },
    }));
  };

  const handleSaveAllocations = async () => {
    setIsLoading(true);
    try {
      for (const departmentId in seatAllocations) {
        for (const community in seatAllocations[departmentId]) {
          await axios.post("/api/counseling/seat-allocation", {
            departmentId: departmentId,
            community: community,
            seatsAvailable: seatAllocations[departmentId][community],
          });
        }
      }
      toast.success("Seat allocations saved successfully!", { icons: <SuccessIcon /> });
      fetchData();
    } catch (error) {
      console.error("Error saving seat allocations:", error);
      toast.error("Failed to save seat allocations.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllocateSeats = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/counseling/allocate", { allocationRound });
      if (response.status === 200) {
        toast.success("Seat allocation completed successfully!", { icons: <SuccessIcon /> });
      } else {
        toast.error("Seat allocation failed: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error allocating seats:", error);
      toast.error("Failed to allocate seats: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/counseling/departments", {
        departmentName: newDepartmentName,
        departmentDesc: newDepartmentDesc,
      });

      if (response.status === 201) {
        toast.success("Department added successfully!", { icons: <SuccessIcon /> });
        setNewDepartmentName("");
        setNewDepartmentDesc("");
        setOpenAddDepartmentDialog(false);
        fetchData();
      } else {
        toast.error("Failed to add department: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding department:", error);
      toast.error("Failed to add department: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/counseling/departments/${departmentId}`);
      toast.success("Department deleted successfully!", { icons: <SuccessIcon /> });
      fetchData();
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("Failed to delete department.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Department Seat Allocation</h2>
        <Dialog open={openAddDepartmentDialog} onOpenChange={setOpenAddDepartmentDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Department</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Department Name
                </Label>
                <Input
                  id="name"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="Desc" className="text-right">
                  Department Description
                </Label>
                <Input
                  id="Desc"
                  value={newDepartmentDesc}
                  onChange={(e) => setNewDepartmentDesc(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleAddDepartment} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Department"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {departments.map((department) => (
        <Card key={department.id} className="mb-4">
          <CardHeader>
            <CardTitle>{department.department_name}</CardTitle>
            <Button
              variant="ghost" // Use ghost variant for a lighter appearance
              size="icon"
              onClick={() => handleDeleteDepartment(department.id)}
              disabled={isLoading}
            >
              <Trash className="h-4 w-4 text-gray-500" /> 
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 pt-5 gap-4">
              {["OC", "BC", "MBC", "SC", "ST"].map((community) => (
                <div key={community} className="flex items-center space-x-2">
                  <Label htmlFor={`${department.id}-${community}`}>{community}</Label>
                  <Input
                    type="number"
                    id={`${department.id}-${community}`}
                    name={`${department.id}-${community}`}
                    value={seatAllocations[department.id]?.[community] || 0}
                    onChange={(e) => handleSeatChange(department.id, community, e.target.value)}
                    className="w-24"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex items-center justify-end space-x-2 mb-4">
        {/* <Label htmlFor="allocationRound">Allocation Round:</Label>
        <Input
          type="number"
          id="allocationRound"
          name="allocationRound"
          value={allocationRound}
          onChange={(e) => setAllocationRound(parseInt(e.target.value, 10) || 1)}
          className="w-24"
          min="1"
        /> */}
        <Button onClick={handleAllocateSeats} className="bg-primary-800" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Allocating...
            </>
          ) : (
            "Allocate Seats"
          )}
        </Button>
        <Button onClick={handleSaveAllocations} className="bg-primary-800" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Allocations"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ManageSeats;