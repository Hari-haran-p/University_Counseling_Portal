import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, User, Book, Ticket, HelpCircle } from "lucide-react"

export function UserSidebar({ toggleSidebar }) {  // Receive toggleSidebar as a prop
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/apply", label: "Apply", icon: FileText },
    { href: "/hallticket", label: "Hall Ticket", icon: Ticket },
    { href: "/exam", label: "Take Exam", icon: Book },
    { href: "/results", label: "View Exam Results", icon: HelpCircle },
    { href: "/counseling", label: "Counseling", icon: FileText }, // ADDED counseling
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <ul className="space-y-2 py-4">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            onClick={toggleSidebar}  // Call toggleSidebar on link click
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