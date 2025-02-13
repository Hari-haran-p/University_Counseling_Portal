"use client"

import "./globals.css"
import { Inter } from "next/font/google"
import Layout from "@/components/Layout"
import AdminLayout from "@/components/AdminLayout"
import React from "react"

const inter = Inter({ subsets: ["latin"] })



export default function RootLayout({
  children,
}) {
  const isAdminRoute = React.useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname.startsWith("/admin")
    }
    return false
  }, [])

  return (
    <html lang="en">
      <body className={inter.className}>
        {isAdminRoute ? <AdminLayout>{children}</AdminLayout> : <Layout>{children}</Layout>}
      </body>
    </html>
  )
}

