// app/admin/counseling/ViewAllotments.jsx
"use client"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ViewAllotments = () => {
    const [viewSeats, setViewSeats] = useState([]) //To allow you to see seats;
    const [isLoading, setIsLoading] = useState(false);

    const handleSeeAllotedSeat = async () => {
        setIsLoading(true);
        try {
            const viewResponse = await axios.get("/api/counseling/seats-view");
            setViewSeats(viewResponse.data)
        } catch (error) {
            console.error("Error fetching seat details:", error);
            alert("An error occurred while fetching.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div>
                <Button onClick={handleSeeAllotedSeat} className="bg-primary-800">
                    {!isLoading ? <>View Allotted Seats</> :
                        <>
                            Loading Results...
                        </>
                    }
                </Button>
            </div>
            <div>
                {isLoading ? (
                        <div className="flex justify-center items-center p-8">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Loading...
                        </div>
                ) : (
                    viewSeats.length > 0 &&
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
                                    {viewSeats.map(i => {
                                        return (
                                            <TableRow>
                                                <TableCell>{i.user_id}</TableCell>
                                                <TableCell>{i.username}</TableCell>
                                                <TableCell>{i.department_name}</TableCell>
                                                <TableCell>{i.description}</TableCell>
                                                <TableCell>{i.mobno}</TableCell>
                                                <TableCell>{i.community}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )
                }
            </div >
        </div>
    )
}

export default ViewAllotments;