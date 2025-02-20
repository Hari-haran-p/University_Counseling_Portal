// app/counseling/StudentPreferences.jsx
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";
import Cookies from "js-cookie"; // Import Cookies

const StudentPreferences = () => {
    const [departments, setDepartments] = useState([]);
    const [preferences, setPreferences] = useState(["", "", "", "", ""]);  // Store preference IDs
    const [isLoading, setIsLoading] = useState(true);
    const [preferencesEnabled, setPreferencesEnabled] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();
    const [userId, setUserId] = useState(null); // User ID

    useEffect(() => {
        // Get the user data from cookies
        // const userData = Cookies.get('userData');
        // if (userData) {
        //     try {
        //         const parsedUserData = JSON.parse(userData);
        //         setUserId(parsedUserData.userId); // Set the user ID
        //     } catch (error) {
        //         console.error("Error parsing user data from cookie:", error);
        //         // Handle error - maybe redirect to login or show an error message
        //     }
        // } else {
        //   router.push("/login"); // Redirect to login if no user data
        //   return; // Stop further execution
        // }

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
    }, [router]); // Add router to the dependency array

    const handlePreferenceChange = (index, departmentId) => {
      const newPreferences = [...preferences];
        newPreferences[index] = departmentId === "null" ? null : departmentId;
        setPreferences(newPreferences);
    };

    const handleSubmit = async () => {
        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

        try {
            await axios.post("/api/counseling/student-preferences", {
                userId: userId, // Use the retrieved userId
                preferences: preferences,
            });
            alert("Preferences saved successfully!");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error saving preferences:", error);
            alert("Failed to save preferences. " + (error.response?.data?.message || ""));
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
</>
    );
};

export default StudentPreferences;