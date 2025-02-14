"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "male",
    mobile: "",
    email: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/registration", formData);

      if (response.status === 200) {
        toast.success(
          "Registration successful! A temporary password has been sent to your email address. Please check your inbox."
        );
        router.push("/login");
      } else {
        toast.error(response.data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-primary-700">
          Register
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              defaultValue="male"
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
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter your mobile number"
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email ID</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white"
          >
            Register
          </Button>
        </form>
      </div>
    </div>
  );
}