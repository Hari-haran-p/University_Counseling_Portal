"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Cookies from "js-cookie";

const HallTicketPage = () => {
  const [hallTicketData, setHallTicketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); 
  const user = JSON.parse(Cookies.get("userData"));    

  const generateHallTicket = async () => {
    setIsLoading(true);
    setErrorMessage(null); // Clear any previous error messages
    try {
      const response = await axios.get(`/api/hall-ticket?userId=${parseInt(user.id)}`);

      if (response.data && response.data.hallTicketData) {
        setHallTicketData(response.data.hallTicketData);
        setShowPreview(true);
      } else {
        switch (response.data.errorType) {
          case "missing_parameter":
            setErrorMessage("Missing user ID. Please contact support.");
            break;
          case "user_not_found":
            setErrorMessage("User not found. Please make sure you are registered.");
            break;
          case "schedule_not_found":
            setErrorMessage("No upcoming exam schedules found. Please check back later.");
            break;
          default:
            setErrorMessage("Failed to generate hall ticket: " + response.data.message);
            break;
        }
        setShowPreview(false);
      }
    } catch (error) {
      console.error("Error fetching hall ticket:", error);

      setErrorMessage(error?.response.data.message || "Failed to generate hall ticket. Please try again later.");
      setShowPreview(false);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadHallTicket = () => {
    if (hallTicketData) {
      const link = document.createElement("a");
      link.href = hallTicketData;
      link.download = "hall_ticket.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Hall Ticket</h1>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Generating hall ticket...
        </div>
      ) : (
        <>
          {!showPreview ? (
            <>
              {errorMessage && (
                <div className="text-red-500 mb-4">{errorMessage}</div>
              )}
              <Button onClick={generateHallTicket} className="bg-primary-800">
                Generate Hall Ticket
              </Button>
            </>
          ) : (
            hallTicketData && (
              <Card className="mt-4">
                <CardContent>
                  <embed src={hallTicketData} type="application/pdf" className="w-full h-[600px]" />
                  <div className="flex justify-end mt-4">
                    <Button onClick={downloadHallTicket} className="bg-green-800">
                      Download Hall Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </>
      )}
    </div>
  );
};

export default HallTicketPage;