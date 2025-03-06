"use client";

import { useState, useEffect } from "react";
import { Calendar, Bell, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import axios from "axios";
import { toast } from "react-fox-toast";
import "react-toastify/dist/ReactToastify.css";
import NotificationDetails from "./NotificationDetails"; // Import the new component
import MailConfiguration from "./MailConfiguration";  // Import the new MailConfiguration component

export default function NotificationManagement() {
  const [selectedNotificationType, setSelectedNotificationType] = useState("");
  const [date, setDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationData, setNotificationData] = useState({}); // No initial state here
  const [key, setKey] = useState("notification"); // this will reset the tabs after every request

  const notificationTypes = [
    "Exam",
    "Preference",
    "Result",
    "Application Deadline",
    "Seat Allocation",
  ];

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const fetchNotificationData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/admin/notification");
      if (response.data) {
        const formattedData = {
          ...response.data,
          application_deadline: response.data.application_deadline
            ? parseISO(response.data.application_deadline)
            : null,
        };
        setNotificationData(formattedData);
        setDate(formattedData.application_deadline || null);
      } else {
        setNotificationData({
          exam: false,
          preference: false,
          result: false,
          application: false,
          application_deadline: null,
          seat_allocation: false,
          exam_start_date: null,
          exam_end_date: null,
          preference_start_date: null,
          preference_end_date: null,
          preference_round: null,
        });

        setDate(null);
      }
    } catch (error) {
      console.error("Error fetching notification data:", error);
      toast.error("Failed to load notification data.");
      setNotificationData({
        exam: false,
        preference: false,
        result: false,
        application: false,
        application_deadline: null,
        seat_allocation: false,
        exam_start_date: null,
        exam_end_date: null,
        preference_start_date: null,
        preference_end_date: null,
        preference_round: null,
      }); // Still set initial state on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = async () => {
    setIsLoading(true);
    try {
      if (!selectedNotificationType) {
        toast.error("Please select a notification type.");
        return;
      }

      const data = { ...notificationData }; // Copy existing state

      if (selectedNotificationType === "Application Deadline") {
        if (!date) {
          toast.error("Please select a deadline date.");
          return;
        }
        data.application = true;
        data.application_deadline = format(
          date,
          "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
        );
      } else {
        // Set the relevant boolean to true based on selectedNotificationType
        const temp =
          selectedNotificationType === "Seat Allocation"
            ? "seat_allocation"
            : selectedNotificationType.toLowerCase(); // Correctly handle "Seat Allocation"

        data[temp] = true;
      }

      console.log("Sending:", data);

      const response = await axios.post("/api/admin/notification", data);

      if (response.status === 200) {
        toast.success("Notification settings updated successfully!");
        fetchNotificationData(); // Refresh data after update
      } else {
        toast.error("Failed to update notification settings.");
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setKey(Math.random().toString(36).substring(7)); //This re-renders the tab contents
    }
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotificationType) {
      toast.error("Please select a notification type to delete.");
      return;
    }

    setIsLoading(true);
    try {
      const data = { ...notificationData }; // Create a copy of the current state

      switch (selectedNotificationType) {
        case "Exam":
          data.exam = false;
          data.exam_start_date = null;
          data.exam_end_date = null;
          break;
        case "Preference":
          data.preference = false;
          data.preference_start_date = null;
          data.preference_end_date = null;
          data.preference_round = null;
          break;
        case "Result":
          data.result = false;
          break;
        case "Application Deadline":
          data.application = false;
          data.application_deadline = null;
          break;
        case "Seat Allocation":
          data.seat_allocation = false;
          break;
        default:
          toast.error("Invalid notification type selected for deletion."); // Add a default case
          setIsLoading(false);
          return;
      }

      console.log("Sending delete request with:", data);

      const response = await axios.post("/api/admin/notification", data);

      if (response.status === 200) {
        toast.success(
          `"${selectedNotificationType}" notification setting deleted!`
        );
        fetchNotificationData(); // Refresh data
      } else {
        toast.error(
          `Failed to delete "${selectedNotificationType}" notification setting.`
        );
      }
    } catch (error) {
      console.error("Error deleting notification setting:", error);
      toast.error("An unexpected error occurred while deleting.");
    } finally {
      setIsLoading(false);
      setKey(Math.random().toString(36).substring(7)); //This re-renders the tab contents
    }
  };

  return (
    <div className="container mx-auto py-6">
      <nav className="flex items-center justify-between border-b pb-4 mb-6">
        <div className="text-2xl font-bold">Admin Tools</div>
      </nav>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notification" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6" key={key}>
              <TabsTrigger value="notification">
                Notification Details
              </TabsTrigger>
              <TabsTrigger value="mail">Mail Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="notification" className="space-y-4">
              <NotificationDetails
                selectedNotificationType={selectedNotificationType}
                setSelectedNotificationType={setSelectedNotificationType}
                date={date}
                setDate={setDate}
                isLoading={isLoading}
                notificationData={notificationData}
                setNotificationData={setNotificationData}
                notificationTypes={notificationTypes}
                fetchNotificationData={fetchNotificationData}
                setKey={setKey}
                handleSendNotification={handleSendNotification}
                handleDeleteNotification={handleDeleteNotification}
              />
            </TabsContent>

            <TabsContent value="mail" className="space-y-4">
              <MailConfiguration notificationTypes={notificationTypes} notificationData={notificationData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}