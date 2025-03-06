// components/MailConfiguration.jsx
"use client";

import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-fox-toast";
import axios from "axios";

const MailConfiguration = ({ notificationTypes, notificationData }) => {
  const [isSending, setIsSending] = useState(false);
  const [sendingType, setSendingType] = useState(null)


  const sendEmailNotification = async (type) => {
    setIsSending(true);
    setSendingType(type)
    try {
      const response = await axios.post("/api/admin/send-notification-email", { type, notificationData }); // Send data to the backend
      if (response.status === 200) {
        toast.success(`"${type}" notification mail sent successfully!`);
      } else {
        toast.error(`Failed to send "${type}" notification mail.`);
      }
    } catch (error) {
      console.log(`Error sending "${type}" notification mail:`, error);
      toast.error(`Failed to send "${type}" notification mail: ` + error.message);
    } finally {
      setIsSending(false);
      setSendingType(null)
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {notificationTypes.map((type) => {
         const isCurrentlySending = isSending && sendingType === type;
        return(
        <Button
          key={type}
          className="flex items-center gap-2"
          onClick={() => sendEmailNotification(type)}
          disabled={isSending}
        >
          {isCurrentlySending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              {type}
            </>
          )}
        </Button>
      )})}
    </div>
  );
};

export default MailConfiguration;