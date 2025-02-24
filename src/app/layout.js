"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/AdminLayout";
import React, { useState, useEffect } from "react"; // Import useState and useEffect
import { ToastContainer } from "react-fox-toast"
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isLoginRoute, setIsLoginRoute] = useState(false);

  useEffect(() => {
    setIsAdminRoute(pathname?.startsWith("/admin") || false);
    setIsLoginRoute(pathname?.startsWith("/login") || false);
  }, [pathname]);



  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastContainer
          position="top-right"
        />
        {isLoginRoute
          ?
          children
          :
          isAdminRoute ? (
            <AdminLayout>{children}</AdminLayout>
          ) : (
            <Layout>{children}</Layout>
          )
        }
      </body>
    </html>
  );
}