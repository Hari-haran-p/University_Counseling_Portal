// src/components/educational-details/EducationalDetails.jsx
"use client";

import { useState, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEducationalDetailsData } from "@/services/educationalDetailsService";
import { toast } from "react-toastify";

export function EducationalDetails({
  formData,
  setFormData,
  errors,
  setErrors,
}) {
  const [loading, setLoading] = useState(true);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));

    // Clear error for the changed field
    setErrors((prevErrors) => ({ ...prevErrors, [id]: undefined }));
  };

  const loadEducationalDetails = async () => {
    setLoading(true);
    try {
      const data = await getEducationalDetailsData();
      setFormData(data);
    } catch (error) {
      console.error("Failed to load educational details:", error);
      toast.error("Failed to load educational details. Please enter manually.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEducationalDetails();
  }, []);

  if (loading) {
    return (
      <CardContent>
        <p>Loading educational details...</p>
      </CardContent>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Educational Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="board_name">School Board Name</Label>
          <Input
            id="board_name"
            placeholder="Enter school board name"
            value={formData.board_name || ""}
            onChange={handleChange}
          />
          {errors.board_name && (
            <p className="text-red-500 text-sm">{errors.board_name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="school_name">School Name</Label>
          <Input
            id="school_name"
            placeholder="Enter school name"
            value={formData.school_name || ""}
            onChange={handleChange}
          />
          {errors.school_name && (
            <p className="text-red-500 text-sm">{errors.school_name}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Month of Passing</Label>
            <Select
              value={formData.month_passout || ""}
              onValueChange={(value) => {
                setFormData((prevData) => ({
                  ...prevData,
                  month_passout: value,
                }));
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  month_passout: undefined,
                }));
              }}
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
            {errors.month_passout && (
              <p className="text-red-500 text-sm">{errors.month_passout}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Year of Passing</Label>
            <Select
              value={formData.year_passout || ""}
              onValueChange={(value) => {
                setFormData((prevData) => ({
                  ...prevData,
                  year_passout: value,
                }));
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  year_passout: undefined,
                }));
              }}
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
            {errors.year_passout && (
              <p className="text-red-500 text-sm">{errors.year_passout}</p>
            )}
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
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="medium">Medium of Instruction</Label>
          <Input
            id="medium"
            placeholder="Enter medium of instruction"
            value={formData.medium || ""}
            onChange={handleChange}
          />
          {errors.medium && (
            <p className="text-red-500 text-sm">{errors.medium}</p>
          )}
        </div>
      </CardContent>
    </>
  );
}