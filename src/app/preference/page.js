// app/preferences/page.js

"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";
import Cookies from 'js-cookie';

const StudentPreferencesPage = () => {
    const [departments, setDepartments] = useState([]);
    const [preferences, setPreferences] = useState(["", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(true);
    const [preferencesEnabled, setPreferencesEnabled] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();
    // const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [departmentsResponse, datesResponse] = await Promise.all([
                    axios.get("/api/counseling/departments"),
                    axios.get("/api/get-preference-dates"),
                ]);
      
                setDepartments(departmentsResponse.data);
      
                if (datesResponse.data && datesResponse.data.length > 0) {
                    const { preference_start_date, preference_end_date } = datesResponse.data[0];
      
                    if (preference_start_date && preference_end_date) {
                        console.log(preference_start_date, preference_end_date);
      
                        let [datePart, timePart] = preference_start_date?.split("T");
                        let [year, month, day] = datePart?.split("-").map(Number);
                        let [hour, minute, second] = timePart.replace("Z", "").split(":").map(num => Math.floor(Number(num)));
      
                        const start = new Date(year, month - 1, day, hour, minute, second);
      
                        [datePart, timePart] = preference_end_date?.split("T");
                        [year, month, day] = datePart.split("-").map(Number);
                        [hour, minute, second] = timePart.replace("Z", "").split(":").map(num => Math.floor(Number(num)));
      
                        const end = new Date(year, month - 1, day, hour, minute, second);
      
                        const now = new Date(); // Get current time in the same format
      
                        if (now >= start && now <= end) {
                            setPreferencesEnabled(true);
                            setMessage("");
                        } else if (now < start) {
                            setPreferencesEnabled(false);
                            setMessage(`Preference selection will open on ${start}.`);
                        } else {
                            setPreferencesEnabled(false);
                            setMessage("Preference selection is now closed.");
                        }
                    } else {
                        setPreferencesEnabled(false);
                        setMessage("Preference start and end dates not set by admin.");
                    }
                } else {
                    setPreferencesEnabled(false);
                    setMessage("No preference dates found. Contact admin.");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setPreferencesEnabled(false);
                setMessage("Failed to load data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
      
        fetchData();
      }, []);

    const handlePreferenceChange = (index, departmentId) => {
        const newPreferences = [...preferences];
        newPreferences[index] = departmentId === "null" ? null : departmentId;
        setPreferences(newPreferences);
    };
    const handleSubmit = async () => {
        // if (!userInfo || !userInfo.userId) {
        //     alert("User information is not available. Please log in again.");
        //     router.push("/login");
        //     return;
        // }
        try {
            await axios.post("/api/counseling/student-preferences", {
                userId: 11,
                preferences: preferences,
            });
            alert("Preferences saved successfully!");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error saving preferences:", error);
            alert("Failed to save preferences.");
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 flex justify-center items-center">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading...
            </div>
        );
    }
    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Student Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                    {!preferencesEnabled ? (
                        <div className="flex justify-center items-center p-8">
                            <p className="text-lg">{message}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }, (_, index) => (
                                <div key={index}>
                                    <Label htmlFor={`preference-${index + 1}`}>Preference {index + 1}</Label>
                                    <Select onValueChange={(value) => handlePreferenceChange(index, value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem key="null" value="null">
                                                No Preference
                                            </SelectItem>
                                            {departments.map((department) => (
                                                <SelectItem key={department.id} value={department.id}>
                                                    {department.department_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                            <Button onClick={handleSubmit} className="bg-primary-800">
                                Save Preferences
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentPreferencesPage;