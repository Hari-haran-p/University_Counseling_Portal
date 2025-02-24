// app/admin/counseling/page.js
"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ManageSeats from "@/components/AdminManageSeats"
import ManageCounselingRounds from "@/components/AdminManageCounselingRounds"
import ViewAllotments from "@/components/AdminViewAllotments"

const AdminCounselingPage = () => {

  return (
    <div className="container mx-auto py-10">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold">Counseling Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="manage-seats" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="manage-seats">Manage Seats</TabsTrigger>
                        <TabsTrigger value="manage-rounds">Manage Rounds</TabsTrigger>
                        <TabsTrigger value="view-allotments">View Allotments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="manage-seats">
                        <ManageSeats />
                    </TabsContent>
                    <TabsContent value="manage-rounds">
                        <ManageCounselingRounds />
                    </TabsContent>
                    <TabsContent value="view-allotments">
                        <ViewAllotments />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
};

export default AdminCounselingPage;