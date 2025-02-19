// src/components/educational-details/EducationalDetails.jsx
"use client";

import { useState, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getEducationalDetailsData } from "@/services/educationalDetailsService"; // Import API functions
import {toast} from "react-toastify";

export function EducationalDetails({formData , setFormData}) {

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    console.log(formData);
    

    useEffect(() => {
        const loadEducationalDetails = async () => {
            try {
                const data = await getEducationalDetailsData();
                setFormData(data);
            } catch (error) {
                console.error("Failed to load educational details:", error);
                toast.error("Failed to load educational details")
            }
        };

        loadEducationalDetails();
    }, []);

    return (
        <>
            <CardHeader>
                <CardTitle>Educational Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* <div className="space-y-2">
                    <Label>Mode of Study</Label>
                    <RadioGroup
                        defaultValue={formData.modeOfStudy || "regular"}
                        className="flex space-x-4"
                        onValueChange={(value) =>
                            setFormData((prevData) => ({
                                ...prevData,
                                modeOfStudy: value,
                            }))
                        }
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="regular" id="regular" />
                            <Label htmlFor="regular">Regular</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="open" id="open" />
                            <Label htmlFor="open">Open School</Label>
                        </div>
                    </RadioGroup>
                </div> */}
                <div className="space-y-2">
                    <Label htmlFor="board_name">School Board Name</Label>
                    <Input
                        id="board_name"
                        placeholder="Enter school board name"
                        value={formData.board_name || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="school_name">School Name</Label>
                    <Input
                        id="school_name"
                        placeholder="Enter school name"
                        value={formData.school_name || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Month of Passing</Label>
                        <Select
                            value={formData.month_passout || ""}
                            onValueChange={(value) =>
                                setFormData((prevData) => ({
                                    ...prevData,
                                    month_passout: value,
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">March</SelectItem>
                                <SelectItem value="4">April</SelectItem>
                                <SelectItem value="5">May</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Year of Passing</Label>
                        <Select
                            value={formData.year_passout || ""}
                            onValueChange={(value) =>
                                setFormData((prevData) => ({
                                    ...prevData,
                                    year_passout: value,
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                                <SelectItem value="2022">2022</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">School Address</Label>
                    <Textarea
                        id="address"
                        placeholder="Enter school address"
                        value={formData.address || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="medium">Medium of Instruction</Label>
                    <Input
                        id="medium"
                        placeholder="Enter medium of instruction"
                        value={formData.medium || ""}
                        onChange={handleChange}
                    />
                </div>
            </CardContent>
        </>
    );
}