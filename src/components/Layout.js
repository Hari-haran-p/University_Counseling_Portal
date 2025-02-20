"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { UserSidebar } from "./UserSidebar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"; // Import axios

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Make a request to the /api/logout endpoint
      const response = await axios.post("/api/logout");

      if (response.status === 200) {
        // Redirect to the login page
        router.push("/login");
        toast.success("Logged out successfully!");
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout.");
    }
  }
  const sidebarRef = useRef(null);  // Ref for the sidebar
  const sidebarWidth = "64"; // The width of the sidebar in rem

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 768 // Only trigger on mobile (adjust breakpoint as needed)
      ) {
        toggleSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);  // Use mousedown for better responsiveness

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Remove the event listener on unmount
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}  // Attach the ref to the sidebar
        className={`
          md:flex w-${sidebarWidth} flex-col bg-primary-800 text-white
          fixed top-0 left-0 h-full z-50
          transition-transform duration-300 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0
        `}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold">University Portal</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {<UserSidebar toggleSidebar={toggleSidebar} />}
        </nav>
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:text-primary-200 hover:bg-primary-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`
          flex-1 flex flex-col overflow-hidden
          ${`md:ml-64`}  // Add left margin on larger devices
        `}
      >
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-64"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <img
                      src="https://imgs.search.brave.com/XoCvQPCR8cwB92wTx6BVnT53TrDFDtYoR58BYS3mj6M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTE5/NjA4Mzg2MS92ZWN0/b3Ivc2ltcGxlLW1h/bi1oZWFkLWljb24t/c2V0LmpwZz9zPTYx/Mng2MTImdz0wJms9/MjAmYz1hOGZ3ZFg2/VUtVVkNPZWROX3Aw/cFBzenU4QjRmNnNq/YXJEbVVHSG5ndmRN/PQ"
                      alt="User"
                      className="rounded-full object-cover"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        John Doe
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        john.doe@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}