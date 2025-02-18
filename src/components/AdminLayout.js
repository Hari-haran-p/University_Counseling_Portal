// import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, GraduationCap, FileText, Settings, LogOut, Menu, Bell, Search, HelpCircle, BookCheck,  } from "lucide-react"
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


export default function AdminLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-primary-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <AdminSidebar />
        </nav>
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
                    <img src="/placeholder.svg?height=32&width=32" alt="Admin" className="rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Admin User</p>
                      <p className="text-xs leading-none text-muted-foreground">admin@example.com</p>
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

function AdminSidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/admin/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/applications", label: "Applications", icon: FileText },
    { href: "/admin/exam", label: "Manage Exam", icon: BookCheck },
    { href: "/admin/results", label: "View Exam Results", icon: HelpCircle }, 
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  return (
    <ul className="space-y-2 py-4">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
              pathname === link.href
                ? "bg-primary-700 text-white"
                : "text-primary-100 hover:bg-primary-700 hover:text-white"
            }`}
          >
            <link.icon className="mr-3 h-5 w-5" />
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

