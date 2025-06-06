"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-fox-toast";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { loginSchema } from "../validators/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import Chatbot from "@/components/Chatsbot";


export default function LoginPage() {

  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
      loginSchema.parse(formData);

      const response = await axios.post("/api/login", formData);

      if (response.status === 200) {
        toast.success("Login successful!", {
          className: "bg-primary-800 text-white rounded-3xl",
        });
        Cookies.set("userData", JSON.stringify(response.data.userData))
        const role = JSON.parse(Cookies.get("userData")).role;
        if (role === "admin") router.push("/admin");
        if (role === "user") router.push("/");
      } else {
        toast.error(response.data.message || "Login failed. Please try again.", {
          className: "bg-primary-600 text-white rounded-3xl",
        });
      }
    } catch (error) {
      if (error.name === "ZodError") {
        const firstErrorMessage = error.errors[0].message;
        toast.error(firstErrorMessage, {
          className: "bg-primary-600 text-white rounded-3xl",
        });
      } else {
        toast.error(
          error.response?.data?.message || "An error occurred during login.", {
          className: "bg-primary-600 text-white rounded-3xl",
        }
        );
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src="/bg.mp4"
      ></video>

      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-primary-700">
          Login
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              onChange={handleChange}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center" // Modified className
            disabled={isLoading}
          >
            {isLoading ? (
              <ClipLoader color="#ffffff" size={20} />
            ) : (
              "Login"
            )}
          </Button>
          <a className="text-sm w-full mt-3 underline text-blue-700" href="/registration">New user ? Click here to signup !!</a>
        </form>
      </div>
      <div className="fixed bottom-5 right-5 z-50">
        <Chatbot />
      </div>
    </div>
  );
}
