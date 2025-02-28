// app/admin/counseling/ManageCounselingRounds.jsx
"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { icons, Loader2 } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { toast } from "react-fox-toast"
import SuccessIcon from "./ui/toast-success"

const ManageCounselingRounds = () => {
    const [counselingRounds, setCounselingRounds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newRound, setNewRound] = useState({
        round_number: 1,
        start_date: "",
        end_date: ""
    });

    useEffect(() => {
        fetchRounds();
    }, []);

    const fetchRounds = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("/api/counseling/rounds");
            setCounselingRounds(response.data);
        } catch (error) {
            console.error("Error fetching counseling rounds:", error);
            toast.error("Failed to load counseling rounds.");
        } finally {
            setIsLoading(false);
        }
    };
    const handleCreateRound = async () => {
        setIsLoading(true);
        try {
            // Add logic to create a new round
            const response = await axios.post("/api/counseling/rounds", newRound);
            if (response.status == 200) {
                toast.success("Round created successfully", {
                    icons: <SuccessIcon />
                });
                fetchRounds()
            }
        } catch (error) {
            console.error("Error creating counseling round:", error);
            toast.error("Round creation failed");
        } finally {
            setIsLoading(false);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRound({ ...newRound, [name]: value });
    };
    const handleActiveClick = async (id, active) => {
        try {
            // Handle Active logic
            const response = await axios.put(`/api/counseling/rounds/${id}`, { is_active: active });
            if (response.status == 201) {
                toast.success(`Round ${active ? "activated" : "deactivated"} successfully`, {
                    icons: <SuccessIcon />
                });
                fetchRounds()
            }
        }
        catch (e) {
            console.error("Error change counseling round active:", e);
            toast.error("Round activation failed");
        }
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">Manage Counseling Rounds</h2>

            {isLoading && (
                <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                </div>
            )}

            {/* Table of existing rounds */}
            {!isLoading && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Round Number</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {counselingRounds.map((round) => (
                            <TableRow key={round.id}>
                                <TableCell>{round.round_number}</TableCell>
                                <TableCell>{format(parseISO(round.start_date), 'MMM dd, yyyy hh:mm a')}</TableCell>
                                <TableCell>{format(parseISO(round.end_date), 'MMM dd, yyyy hh:mm a')}</TableCell>
                                <TableCell>{round.is_active ? "Yes" : "No"}</TableCell>
                                <TableCell>
                                    {round.is_active === false ?
                                        <Button onClick={() => handleActiveClick(round.id, true)}>Activate</Button>
                                        :
                                        <Button onClick={() => handleActiveClick(round.id, false)}>Disable</Button>
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Form to create a new round */}
            <Card>
                <CardHeader>
                    <CardTitle>Create New Round</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="round_number">Round Number</Label>
                            <Input
                                type="number"
                                id="round_number"
                                name="round_number"
                                value={newRound.round_number}
                                onChange={handleInputChange}
                                min="1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                type="datetime-local"
                                id="start_date"
                                name="start_date"
                                value={newRound.start_date}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                type="datetime-local"
                                id="end_date"
                                name="end_date"
                                value={newRound.end_date}
                                onChange={handleInputChange}
                            />
                        </div>
                        <Button onClick={handleCreateRound} className="bg-primary-800">Create Round</Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
export default ManageCounselingRounds;