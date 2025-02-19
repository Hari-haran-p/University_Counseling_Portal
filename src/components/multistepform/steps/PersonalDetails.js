// src/components/personal-details/PersonalDetails.jsx
"use client";

import { useState, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPersonalDetailsData } from "@/services/personalDetailsService"; // Import API functions
import { toast } from "react-toastify";
import {format} from "date-fns";

export function PersonalDetails({formData , setFormData}) {

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), "yyyy-MM-dd");
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  };

  const loadPersonalDetails = async () => {
    try {
      const data = await getPersonalDetailsData();
      // Format the date before setting the formData
      const formattedDob = data.dob ? formatDate(data.dob) : "";
      setFormData({ ...data, dob: formattedDob });
    } catch (error) {
      console.error("Failed to load personal details:", error);
      toast.error("Failed to load personal details");
    }
  };

  useEffect(() => {
    loadPersonalDetails();
  }, []);

  return (
    <>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name || ""}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email || ""}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobno">Mobile Number</Label>
            <Input
              id="mobno"
              type="tel"
              placeholder="Enter mobile number"
              value={formData.mobno || ""}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob || ""} // Use the formatted date
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup
            defaultValue={formData.gender || "male"}
            className="flex space-x-4"
            onValueChange={(value) =>
              setFormData((prevData) => ({ ...prevData, gender: value }))
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label>Religion</Label>
          <Select
            value={formData.religion || ""}
            onValueChange={(value) =>
              setFormData((prevData) => ({
                ...prevData,
                religion: value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select religion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hinduism">Hinduism</SelectItem>
              <SelectItem value="christianity">Christianity</SelectItem>
              <SelectItem value="islam">Islam</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="parent_name">Parent/Guardian Name</Label>
            <Input
              id="parent_name"
              placeholder="Enter parent/guardian name"
              value={formData.parent_name || ""}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent_mobno">Parent/Guardian Mobile</Label>
            <Input
              id="parent_mobno"
              type="tel"
              placeholder="Enter parent/guardian mobile"
              value={formData.parent_mobno || ""}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address1">Address Line 1</Label>
          <Input
            id="address1"
            placeholder="Enter door no. & street name"
            value={formData.address1 || ""}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address2">Address Line 2</Label>
          <Input
            id="address2"
            placeholder="Enter area name"
            value={formData.address2 || ""}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              placeholder="Enter pincode"
              value={formData.pincode || ""}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Select
              value={formData.state || ""}
              onValueChange={(value) =>
                setFormData((prevData) => ({ ...prevData, state: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tn">Tamil Nadu</SelectItem>
                <SelectItem value="ka">Karnataka</SelectItem>
                <SelectItem value="kl">Kerala</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Enter city"
              value={formData.city || ""}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="community">Community</Label>
          <Input
            id="community"
            placeholder="Enter community"
            value={formData.community || ""}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mother_tongue">Mother Tongue</Label>
          <Input
            id="mother_tongue"
            placeholder="Enter mother tongue"
            value={formData.mother_tongue || ""}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="native_state">Native State</Label>
          <Input
            id="native_state"
            placeholder="Enter native state"
            value={formData.native_state || ""}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            placeholder="Enter district"
            value={formData.district || ""}
            onChange={handleChange}
          />
        </div>
      </CardContent>
    </>
  );
}