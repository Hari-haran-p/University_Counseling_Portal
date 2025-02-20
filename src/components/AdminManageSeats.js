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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";  // Make sure you have this
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const ManageSeats = () => {
    const [departments, setDepartments] = useState([]);
    const [seatAllocations, setSeatAllocations] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [allocationRound, setAllocationRound] = useState(1); // Add allocation round state


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

          // Initialize seat allocations state, correctly merging existing data
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

          // Populate with actual saved data, if any.  This is important.
            seatsResponse.data.forEach((seat) => {
            if (initialAllocations[seat.department_id]) {  // Check if the department exists
              initialAllocations[seat.department_id][seat.community] = seat.seats_available;
            }
            });

          setSeatAllocations(initialAllocations);


        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to load data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeatChange = (departmentId, community, value) => {
        setSeatAllocations((prevState) => ({
            ...prevState,
            [departmentId]: {
                ...prevState[departmentId],
                [community]: parseInt(value, 10) || 0, // Ensure integer
            },
        }));
    };

    const handleSaveAllocations = async () => {
        setIsLoading(true);
        try {
            // Iterate through all departments and communities and save the data
            for (const departmentId in seatAllocations) {
                for (const community in seatAllocations[departmentId]) {
                    await axios.post("/api/counseling/seat-allocation", {
                        departmentId: departmentId,
                        community: community,
                        seatsAvailable: seatAllocations[departmentId][community],
                    });
                }
            }
            alert("Seat allocations saved successfully!");
            fetchData(); // Refresh data after saving
        } catch (error) {
            console.error("Error saving seat allocations:", error);
            alert("Failed to save seat allocations.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAllocateSeats = async () => { // Add the allocation function
      setIsLoading(true);
      try {
        const response = await axios.post("/api/counseling/allocate", { allocationRound }); // Send allocation round
        if (response.status === 200) {
          alert("Seat allocation completed successfully!");
          // Consider fetching updated data here, if you have a way to see allocated seats
        } else {
          alert("Seat allocation failed: " + (response.data.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error allocating seats:", error);
        alert("Failed to allocate seats: " + (error.response?.data?.message || "Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };


    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Department Seat Allocation</h2>
                {departments.map((department) => (
                    <Card key={department.id} className="mb-4">
                        <CardHeader>
                            <CardTitle>{department.department_name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <div className="flex items-center space-x-2 mb-4">
                <Label htmlFor="allocationRound">Allocation Round:</Label>
                <Input
                    type="number"
                    id="allocationRound"
                    name="allocationRound"
                    value={allocationRound}
                    onChange={(e) => setAllocationRound(parseInt(e.target.value, 10) || 1)}
                    className="w-24"
                    min="1"
                />
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