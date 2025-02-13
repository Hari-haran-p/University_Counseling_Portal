"use client"
import { usePathname } from "next/navigation"
import { LogOut, Menu, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { UserSidebar } from "./UserSidebar"
// import { AdminSidebar } from "./admin-sidebar"

export default function Layout({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-primary-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">University Portal</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">{ <UserSidebar />}</nav>
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:text-primary-200 hover:bg-primary-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input type="search" placeholder="Search..." className="pl-8 w-64" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <img src="/placeholder.svg?height=32&width=32" alt="User" className="rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">John Doe</p>
                      <p className="text-xs leading-none text-muted-foreground">john.doe@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

