// import type { ReactNode } from "react"
'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Layout({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-800 text-black">
        <div className="p-4">
          <h1 className="text-2xl font-bold">University Portal</h1>
        </div>
        <nav className="mt-8">{isAdmin ? <AdminSidebar /> : <UserSidebar />}</nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}

function AdminSidebar() {
  return (
    <ul>
      <SidebarLink href="/admin/dashboard" label="Dashboard" />
      <SidebarLink href="/admin/applications" label="Applications" />
      <SidebarLink href="/admin/courses" label="Courses" />
      <SidebarLink href="/admin/users" label="Users" />
    </ul>
  )
}

function UserSidebar() {
  return (
    <ul>
      <SidebarLink href="/dashboard" label="Dashboard" />
      <SidebarLink href="/apply" label="Apply" />
      <SidebarLink href="/courses" label="Courses" />
      <SidebarLink href="/profile" label="Profile" />
    </ul>
  )
}

function SidebarLink({ href, label }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <li>
      <Link href={href} className={`block py-2 px-4 ${isActive ? "bg-primary-700" : "hover:bg-primary-700"}`}>
        {label}
      </Link>
    </li>
  )
}

