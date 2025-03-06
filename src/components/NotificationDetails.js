// components/NotificationDetails.jsx
"use client";

import { useState, useEffect } from "react";
import { Mail, Bell, Trash2, Loader2 } from "lucide-react"; // Added Loader2
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import axios from "axios";
import { toast } from "react-fox-toast";

const NotificationDetails = ({
  selectedNotificationType,
  setSelectedNotificationType,
  date,
  setDate,
  isLoading,
  notificationData,
  setNotificationData,
  notificationTypes,
  fetchNotificationData,
  setKey,
  handleSendNotification,
  handleDeleteNotification,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Select onValueChange={setSelectedNotificationType}>
            <SelectTrigger>
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              {notificationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedNotificationType === "Application Deadline" && (
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select deadline date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6 space-x-2">
        <Button onClick={handleSendNotification} disabled={isLoading || !selectedNotificationType}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Notification"
          )}
        </Button>
        <Button
          variant="destructive"
          onClick={handleDeleteNotification}
          disabled={isLoading || !selectedNotificationType}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Notification
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NotificationDetails;