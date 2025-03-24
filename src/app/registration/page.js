"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-fox-toast";
import "react-toastify/dist/ReactToastify.css"; // Still needed for base styles
import axios from "axios";
import { registrationSchema } from "@/app/validators/registration";
import { ClipLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Chatbot from "@/components/Chatsbot";

export default function RegistrationPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        dob: "",
        gender: "male",
        mobile: "",
        email: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            registrationSchema.parse(formData); // Validate with Zod

            const response = await axios.post("/api/registration", formData);

            if (response.status === 200) {
                toast.success("Registration successful! A temporary password has been sent to your email address. Please check your inbox.", {
                    className: 'bg-primary-800 text-white rounded-3xl',
                });
                router.push("/login");
            } else {
                toast.error(response.data.message || "Registration failed. Please try again.", {
                    className: 'bg-primary-600 text-white rounded-3xl',
                });
            }
        } catch (error) {
            if (error.name === "ZodError") {
                // Handle Zod validation errors
                const firstErrorMessage = error.errors[0].message;
                toast.error(firstErrorMessage, {
                    className: 'bg-primary-600 text-white rounded-3xl',
                });

            } else {
                toast.error(error.response?.data?.message || "An error occurred during registration.", {
                    className: 'bg-primary-600 text-white rounded-3xl',
                });

            }
            console.error("Registration error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-primary-700">Register</h1>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Enter your name" onChange={handleChange} />
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
                        className="w-full mb-9 bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ClipLoader color="#ffffff" size={20} />
                        ) : (
                            "Register"
                        )}
                    </Button>
                    <a className="text-sm w-full mt-3 underline text-blue-700" href="/login">Already user ? Click here to signin !!</a>
                </form>
            </div>
            <div className="fixed bottom-5 right-5 z-50">
                <Chatbot />
            </div>
        </div>
    );
}