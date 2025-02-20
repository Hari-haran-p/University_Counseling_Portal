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
import { getPersonalDetailsData } from "@/services/personalDetailsService";
import { toast } from "react-toastify";
import { format } from "date-fns";

export function PersonalDetails({ formData, setFormData, errors, setErrors }) {
  const [loading, setLoading] = useState(true); // Add a loading state

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));

    // Clear error for the changed field
    setErrors((prevErrors) => ({ ...prevErrors, [id]: undefined }));
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
    setLoading(true); // Set loading to true before fetching data
    try {
      const data = await getPersonalDetailsData();
      const formattedDob = data.dob ? formatDate(data.dob) : "";
      setFormData({ ...data, dob: formattedDob });
    } catch (error) {
      console.error("Failed to load personal details:", error);
      toast.error("Failed to load personal details. Please enter manually.");
      // Do NOT set formData to empty. Let the form load with initial state.
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    loadPersonalDetails();
  }, []);

  // Show a loading message while data is being fetched
  if (loading) {
    return (
      <CardContent>
        <p>Loading personal details...</p>
      </CardContent>
    );
  }

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
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
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
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
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
            {errors.mobno && (
              <p className="text-red-500 text-sm">{errors.mobno}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob || ""}
              onChange={handleChange}
            />
            {errors.dob && (
              <p className="text-red-500 text-sm">{errors.dob}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup
            defaultValue={formData.gender || "male"}
            className="flex space-x-4"
            onValueChange={(value) => {
              setFormData((prevData) => ({ ...prevData, gender: value }));
              setErrors((prevErrors) => ({ ...prevErrors, gender: undefined })); // Clear error
            }}
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
          {errors.gender && (
            <p className="text-red-500 text-sm">{errors.gender}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Religion</Label>
          <Select
            value={formData.religion || ""}
            onValueChange={(value) => {
              setFormData((prevData) => ({
                ...prevData,
                religion: value,
              }));
              setErrors((prevErrors) => ({
                ...prevErrors,
                religion: undefined,
              }));
            }}
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
          {errors.religion && (
            <p className="text-red-500 text-sm">{errors.religion}</p>
          )}
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
            {errors.parent_name && (
              <p className="text-red-500 text-sm">{errors.parent_name}</p>
            )}
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
            {errors.parent_mobno && (
              <p className="text-red-500 text-sm">{errors.parent_mobno}</p>
            )}
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
          {errors.address1 && (
            <p className="text-red-500 text-sm">{errors.address1}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address2">Address Line 2</Label>
          <Input
            id="address2"
            placeholder="Enter area name"
            value={formData.address2 || ""}
            onChange={handleChange}
          />
          {errors.address2 && (
            <p className="text-red-500 text-sm">{errors.address2}</p>
          )}
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
            {errors.pincode && (
              <p className="text-red-500 text-sm">{errors.pincode}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Select
              value={formData.state || ""}
              onValueChange={(value) => {
                setFormData((prevData) => ({ ...prevData, state: value }));
                setErrors((prevErrors) => ({ ...prevErrors, state: undefined }));
              }}
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
            {errors.state && (
              <p className="text-red-500 text-sm">{errors.state}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Enter city"
              value={formData.city || ""}
              onChange={handleChange}
            />
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}
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
          {errors.community && (
            <p className="text-red-500 text-sm">{errors.community}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mother_tongue">Mother Tongue</Label>
          <Input
            id="mother_tongue"
            placeholder="Enter mother tongue"
            value={formData.mother_tongue || ""}
            onChange={handleChange}
          />
          {errors.mother_tongue && (
            <p className="text-red-500 text-sm">{errors.mother_tongue}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="native_state">Native State</Label>
          <Input
            id="native_state"
            placeholder="Enter native state"
            value={formData.native_state || ""}
            onChange={handleChange}
          />
          {errors.native_state && (
            <p className="text-red-500 text-sm">{errors.native_state}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            placeholder="Enter district"
            value={formData.district || ""}
            onChange={handleChange}
          />
          {errors.district && (
            <p className="text-red-500 text-sm">{errors.district}</p>
          )}
        </div>
      </CardContent>
    </>
  );
}