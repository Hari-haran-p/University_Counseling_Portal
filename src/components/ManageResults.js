// app/admin/results/components/ManageResults.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Calendar as calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import  {Calendar}  from "@/components/ui/calendar"
// import { Popover } from "@/components/ui/popover"

const ManageResults = () => {
  const [publishDate, setPublishDate] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePublishDateChange = (date) => {
    setPublishDate(date ? format(date, "yyyy-MM-dd") : "");
  };

  const handleDownload = async (formatType) => {
    setIsDownloading(true);
    try {
      // Simulate downloading with a 1.5 second delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(`Downloading results in ${formatType} format!`);
    } catch (error) {
      console.error(`Error downloading ${formatType}:`, error);
      alert(`Failed to download ${formatType}.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSetPublishDate = async () => {
    try {
      // Simulate setting the publish date with a 1.5 second delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(`Publish date set to ${publishDate}!`);
    } catch (error) {
      console.error("Error setting publish date:", error);
      alert("Failed to set publish date.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Download Results Section */}
      <section className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">Download Results</h3>
        <div className="flex space-x-4">
          <Button
            onClick={() => handleDownload("PDF")}
            disabled={isDownloading}
            className="bg-primary-800 hover:bg-primary-700"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading PDF...
              </>
            ) : (
              "Download as PDF"
            )}
          </Button>
          <Button
            onClick={() => handleDownload("Excel")}
            disabled={isDownloading}
            className="bg-primary-800 hover:bg-primary-700"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading Excel...
              </>
            ) : (
              "Download as Excel"
            )}
          </Button>
        </div>
      </section>

      {/* Set Publish Date Section */}
      <section className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">Set Publish Date</h3>
        <div className="flex items-center space-x-4">
        <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !publishDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {publishDate ? format(publishDate, "yyyy-MM-dd") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={6}>
          <Calendar
            mode="single"
            selected={publishDate}
            onSelect={handlePublishDateChange}
            disabled={(date) =>
              date > new Date() || date < new Date("2024-01-01")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
          <Button onClick={handleSetPublishDate} className="bg-primary-800 hover:bg-primary-700">
            Set Date
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ManageResults;