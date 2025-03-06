"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { toast } from "react-fox-toast";

const categoryConfig = {
  exam: {
    label: "Exam",
    color: "bg-blue-100 text-blue-800",
  },
  preference: {
    label: "Preference",
    color: "bg-purple-100 text-purple-800",
  },
  result: {
    label: "Result",
    color: "bg-green-100 text-green-800",
  },
  seatAllocation: {
    label: "Seat Allocation",
    color: "bg-amber-100 text-amber-800",
  },
  applicationDeadline: {
    label: "Application Deadline",
    color: "bg-red-100 text-red-800",
  },
};

const formatDate = (dateString) => {
  if (!dateString) return null; // Handle null or undefined date strings

  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/admin/notification");
      if (response.data) {
        // Process and filter notifications based on their 'true' state
        const notificationData = response.data;
        const transformedNotifications = [];

        if (notificationData.exam) {
          transformedNotifications.push({
            id: 1,
            category: "exam",
            title: "Entrance Examination",
            startDate: notificationData.exam_start_date,
            endDate: notificationData.exam_end_date,
            description: "Examination schedule released, Don't Forget to Take the Exam",
            isRead: false,
          });
        }
        if (notificationData.preference) {
          transformedNotifications.push({
            id: 2,
            category: "preference",
            title: "Course Preference Selection",
            startDate: notificationData.preference_start_date,
            endDate: notificationData.preference_end_date,
            round: notificationData.preference_round,
            description: "Counseling preference selection is opened , Make your selections now!",
            isRead: false,
          });
        }
        if (notificationData.result) {
          transformedNotifications.push({
            id: 3,
            category: "result",
            description: "Exam results have been published. Please check the View Exam Results Page for Results.",
            isRead: false,
          });
        }
        if (notificationData.seat_allocation) {
          transformedNotifications.push({
            id: 4,
            category: "seatAllocation",
            description:
              "Your seat has been allotted. Please check the Counceling page to view your results.",
            isRead: false,
          });
        }
        if (
          notificationData.application &&
          notificationData.application_deadline
        ) {
          transformedNotifications.push({
            id: 5,
            category: "applicationDeadline",
            title: "Complete the Details",
            deadline: notificationData.application_deadline,
            description: "Complete your application now!",
            isRead: false,
          });
        }
        setNotifications(transformedNotifications);
      } else {
        setNotifications([]); // Handle no data case
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications.");
      setNotifications([]); // Ensure notifications are empty on error
    } finally {
      setIsLoading(false);
    }
  };

  const countUnread = () => {
    return notifications.filter((notification) => !notification.isRead).length;
  };

  const unreadCount = countUnread();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="py-2 px-4 border-b">
          <h3 className="font-medium">Notifications</h3>
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({ notification }) {
  const category = categoryConfig[notification.category];

  return (
    <div
      className={cn(
        "border-b p-4 last:border-0",
        !notification.isRead && "bg-muted/50"
      )}
    >
      <div className={cn("relative", !notification.isRead && "pl-3")}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              category.color
            )}
          >
            {category.label}
          </span>
        </div>

        {notification.title && (
          <div className="font-medium">{notification.title}</div>
        )}

        {notification.category === "exam" && (
          <div className="text-xs text-muted-foreground">
            {formatDate(notification.startDate)} -{" "}
            {formatDate(notification.endDate)}
          </div>
        )}

        {notification.category === "preference" && (
          <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
            <div className="px-2 bg-blue-200 rounded-lg">
              <span>Round  </span>
              <span>{notification.round}</span>
            </div>
            <span>
              {formatDate(notification.startDate)} -{" "}
              {formatDate(notification.endDate)}
            </span>
          </div>
        )}

        {notification.category === "applicationDeadline" &&
          notification.deadline && (
            <div className="text-xs text-muted-foreground">
              Deadline: {formatDate(notification.deadline)}
            </div>
          )}

        <div className="mt-1 text-sm">{notification.description}</div>
      </div>
    </div>
  );
}
