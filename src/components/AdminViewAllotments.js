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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download } from "lucide-react"; // Import Download icon
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import * as XLSX from 'xlsx';


const ViewAllotments = () => {
    const [viewSeats, setViewSeats] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSeeAllotedSeat = async () => {
        setIsLoading(true);
        try {
            const viewResponse = await axios.get("/api/counseling/seats-view");
            setViewSeats(viewResponse.data);
        } catch (error) {
            console.error("Error fetching seat details:", error);
            alert("An error occurred while fetching.");
        } finally {
            setIsLoading(false);
        }
    };

    const generatePdf = () => {
        if (viewSeats.length === 0) {
          return; // No data to export
        }
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Allotted Seats", 14, 20);
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        const headers = ["User ID", "Username", "Department Name", "Description", "Mobile No", "Community"];
        const data = viewSeats.map(seat => [
            seat.user_id,
            seat.username,
            seat.department_name,
            seat.description,
            seat.mobno,
            seat.community
        ]);

        doc.autoTable({
            head: [headers],
            body: data,
            startY: 40,
            headStyles: { fillColor: [40, 44, 52] },
            styles: { overflow: 'linebreak', fontSize: 10 },
            columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 35 } },
        });
        doc.save("allotted_seats.pdf");
    };

    const generateExcel = () => {
      if (viewSeats.length === 0) {
        return; // No data to export.
      }
        const headers = ["User ID", "Username", "Department Name", "Description", "Mobile No", "Community"];
        const data = viewSeats.map(result => ({
            "User ID": result.user_id,
            "Username": result.username,
            "Department Name": result.department_name,
            "Description": result.description,
            "Mobile No": result.mobno,
            "Community": result.community
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data, { header: headers });
        XLSX.utils.book_append_sheet(wb, ws, "Allotted Seats");
        XLSX.writeFile(wb, "allotted_seats.xlsx");
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Button onClick={handleSeeAllotedSeat} className="bg-primary-800">
                    {!isLoading ? <>View Allotted Seats</> :
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                        </>
                    }
                </Button>
                {/* Download Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isLoading || viewSeats.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => generatePdf()}>
                      PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generateExcel()}>
                      Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
            <div>
                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Loading...
                    </div>
                ) : (
                    viewSeats.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-3xl font-bold">Seat View</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User Id</TableHead>
                                            <TableHead>UserName</TableHead>
                                            <TableHead>Department Name</TableHead>
                                            <TableHead>Department Description</TableHead>
                                            <TableHead>Mobile No</TableHead>
                                            <TableHead>Community</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {viewSeats.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.user_id}</TableCell>
                                                <TableCell>{item.username}</TableCell>
                                                <TableCell>{item.department_name}</TableCell>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell>{item.mobno}</TableCell>
                                                <TableCell>{item.community}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )
                )}
            </div>
        </div>
    );
};

export default ViewAllotments;