// app/counseling/AvailableSeats.jsx
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
import { Loader2 } from "lucide-react";

const AvailableSeats = () => {
  const [availableSeats, setAvailableSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAvailableSeats();
  }, []);

  const fetchAvailableSeats = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/counseling/available-seats");
      setAvailableSeats(response.data);
    } catch (error) {
      console.error("Error fetching available seats:", error);
      alert("Failed to load available seats.");
    } finally {
      setIsLoading(false);
    }
  };

  // Group seats by department name for better presentation
  const groupedSeats = availableSeats.reduce((acc, seat) => {
    if (!acc[seat.department_name]) {
      acc[seat.department_name] = [];
    }
    acc[seat.department_name].push(seat);
    return acc;
  }, {});

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Loading available seats...
        </div>
      ) : (
        <>
          {Object.entries(groupedSeats).map(([departmentName, seats]) => (
            <div key={departmentName} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{departmentName}</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Community</TableHead>
                    <TableHead>Seats Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seats.map((seat) => (
                    <TableRow key={`${seat.department_name}-${seat.community}`}>
                      <TableCell>{seat.community}</TableCell>
                      <TableCell>{seat.seats_available}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default AvailableSeats;