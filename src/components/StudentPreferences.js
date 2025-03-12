// app/counseling/StudentPreferences.jsx
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { icons, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-fox-toast";
import SuccessIcon from "./ui/toast-success";

const StudentPreferences = () => {
    const [departments, setDepartments] = useState([]);
    const [preferences, setPreferences] = useState(["", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(true);
    const [preferencesEnabled, setPreferencesEnabled] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    useEffect(() => {

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [departmentsResponse, datesResponse, preferencesResponse, seatAllotmentResponse] = await Promise.all([
                    axios.get("/api/counseling/departments"),
                    axios.get("/api/get-preference-dates"),
                    axios.get(`/api/counseling/student-preferences`),
                    axios.get("/api/get-seat-allotment")
                ]);

                setDepartments(departmentsResponse.data);
                
                if(seatAllotmentResponse.data && seatAllotmentResponse.data.status === true){
                    setPreferencesEnabled(false);
                    setMessage("Seat already allocated and you cannot post preference for this round");
                    return;
                }

                // Date check - same as before, but now inside this combined useEffect
                if (datesResponse.data && datesResponse.data.length > 0) {
                    const { preference_start_date, preference_end_date } = datesResponse.data[0];

                    if (preference_start_date && preference_end_date) {
                        const startDate = new Date(preference_start_date);
                        const endDate = new Date(preference_end_date);
                        const now = new Date();

                        if (now >= startDate && now <= endDate) {
                            setPreferencesEnabled(true);
                            setMessage("");
                        } else if (now < startDate) {
                            setPreferencesEnabled(false);
                            setMessage(`Preference selection will open on ${format(startDate, "MMM dd, yyyy hh:mm a")}.`);
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
                // console.log(departments.map((dept)=> dept.id == ));

                // Set preferences if they exist
                if (preferencesResponse.data) {
                    const fetchedPreferences = preferencesResponse.data;

                    setPreferences([
                        fetchedPreferences.preference_1 || "", // Use empty string as default
                        fetchedPreferences.preference_2 || "",
                        fetchedPreferences.preference_3 || "",
                        fetchedPreferences.preference_4 || "",
                        fetchedPreferences.preference_5 || "",
                    ]);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                setPreferencesEnabled(false);
                setMessage(error?.response?.data?.message || "Failed to load data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
        
    }, [router]);


    const handlePreferenceChange = (index, departmentId) => {
        const newPreferences = [...preferences];
        // Convert "null" string (from the "No Preference" option) to actual null.
        newPreferences[index] = departmentId === "null" ? null : departmentId;
        setPreferences(newPreferences);
    };


    const handleSubmit = async () => {

        try {
            await axios.post("/api/counseling/student-preferences", {
                preferences: preferences,
            });
            toast.success("Preferences saved successfully!", {
                icons: <SuccessIcon />,
                className: 'bg-primary-800 text-white rounded-3xl',
            });
            router.push("/");
        } catch (error) {
            console.error("Error saving preferences:", error);
            toast.error("Failed to save preferences. " + (error.response?.data?.message || ""), {
                className: 'bg-primary-600 text-white rounded-3xl',
            });
        }
    };


    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading...
            </div>
        );
    }

    return (
        <>
            {!preferencesEnabled ? (
                <div className="text-center">
                    {message}
                </div>
            ) : (
                <div className="space-y-4">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div key={index}>
                            <label htmlFor={`preference-${index + 1}`} className="block text-sm font-medium text-gray-700">
                                Preference {index + 1}
                            </label>
                            <select
                                id={`preference-${index + 1}`}
                                value={preferences[index] || ""}
                                onChange={(e) => handlePreferenceChange(index, e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option key="null" value="null">No Preference</option>
                                {departments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                        {department.department_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                    <Button onClick={handleSubmit} className="bg-primary-800">
                        Save Preferences
                    </Button>
                </div>
            )}
        </>
    );
};

export default StudentPreferences;