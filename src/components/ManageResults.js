// app/admin/results/components/ManageResults.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { toast } from 'react-fox-toast';  // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import CSS
import SuccessIcon from "./ui/toast-success";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";


const ManageResults = () => {
  const [publishDate, setPublishDate] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCurrentResultDate();
  }, []);

  const fetchCurrentResultDate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/get-dates");
      if (response.data && response.data.length > 0) {
        const initialDate = response.data[0].result_date;
        // Check if initialDate is valid before parsing
        if (initialDate) {
          setPublishDate(format(parseISO(initialDate), "yyyy-MM-dd"));
        } else {
          setPublishDate(""); // or some other default, if result_date can be null
        }

      }
    } catch (error) {
      console.error("Error fetching current result date:", error);
      toast.error("Failed to load current result date.", {
        className: 'bg-primary-600 text-white rounded-3xl',
      }); // Use toast.error
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishDateChange = (date) => {
    setPublishDate(date ? format(date, "yyyy-MM-dd") : "");
  };

  const generatePdf = (examResults) => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text("Exam Results", 105, 15, null, null, "center");

    // Prepare data for the table
    const headers = ["User ID", "User Name", "Score", "Community", "Overall Rank", "Community Rank"];
    const data = examResults.map(result => [
      result.user_id,
      result.name,
      result.score,
      result.community,
      result.overall_rank,
      result.community_rank,
    ]);

    // Add the table to the PDF
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 25, // Start below the title
      headStyles: { fillColor: [40, 44, 52] },
      styles: { overflow: 'linebreak', fontSize: 10 },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 35 } },
    });

    // Save or download the PDF
    doc.save("exam_results.pdf");
  };

  const generateExcel = (examResults) => {
    // Prepare data for the Excel sheet
    const headers = ["User ID", "User Name", "Score", "Community", "Overall Rank", "Community Rank"];
    const data = examResults.map(result => ({
      "User ID": result.user_id,
      "User Name": result.name,
      "Score": result.score,
      "Community": result.community,
      "Overall Rank": result.overall_rank,
      "Community Rank": result.community_rank,
    }));

    // Create a new workbook and add a worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Exam Results");

    // Save or download the Excel file
    XLSX.writeFile(wb, "exam_results.xlsx");
  };

  const handleDownload = async (formatType) => {
    setIsDownloading(true);
    try {
      // Fetch exam results from your API endpoint
      const response = await axios.get("/api/exam-result");

      if (formatType === "PDF") {
        generatePdf(response.data);
      } else if (formatType === "Excel") {
        generateExcel(response.data);
      } else {
        throw new Error("Invalid format type");
      }
      toast.success(`Downloading results in ${formatType} format!`, {
        className: 'bg-primary-800 text-white rounded-3xl',
      });  // Use toast.success

    } catch (error) {
      console.error(`Error downloading ${formatType}:`, error);
      toast.error(`Failed to download ${formatType}.`, {
        className: 'bg-primary-600 text-white rounded-3xl',
      }); // Use toast.error
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSetPublishDate = async () => {
    setIsLoading(true);
    try {
      await axios.post("/api/admin/update-result-date", { resultDate: publishDate });
      toast.success(`Publish date set to ${publishDate}!`, {
        icon: <SuccessIcon />,
        className: 'bg-primary-600 text-white rounded-3xl',
      }); // Use toast.success
      fetchCurrentResultDate(); // Refresh the date after setting
    } catch (error) {
      console.error("Error setting publish date:", error);
      toast.error("Failed to set publish date.", {
        className: 'bg-primary-600 text-white rounded-3xl',
      }); // Use toast.error

    } finally {
      setIsLoading(false);
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
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {publishDate ? format(parseISO(publishDate), "yyyy-MM-dd") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" sideOffset={6}>
              <Calendar
                mode="single"
                selected={publishDate ? parseISO(publishDate) : undefined}
                onSelect={handlePublishDateChange}
                disabled={(date) =>
                  date < new Date() || date < new Date("2024-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleSetPublishDate} className="bg-primary-800 hover:bg-primary-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting...
              </>
            ) : (
              "Set Date"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ManageResults;