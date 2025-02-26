"use client"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-fox-toast";
import { Loader2 } from "lucide-react"; // Import Loader2

export function BulkUpload({ onUploadComplete }) {
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // Loading state

  const handleBulkUpload = async () => {
    if (!bulkUploadFile) {
      toast.error("Please select a file to upload.", {
        className: 'bg-primary-600 text-white rounded-3xl',
      });
      return;
    }

    setIsUploading(true); // Set loading to true
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const questions = JSON.parse(e.target.result);
        await axios.post("/api/questions/bulk", questions);
        toast.success("Questions uploaded successfully!", {
          className: 'bg-primary-800 text-white rounded-3xl',
        });
        setBulkUploadFile(null);
        onUploadComplete();
      } catch (error) {
        console.error("Error uploading questions:", error);
        toast.error("Failed to upload questions.", {
          className: 'bg-primary-600 text-white rounded-3xl',
        });
      } finally {
        setIsUploading(false);  // Reset loading to false
      }
    };

    reader.onerror = () => { //Added error handling
      toast.error("Failed to read the file.", {
        className: 'bg-primary-600 text-white rounded-3xl',
      });
      setIsUploading(false);
    }

    reader.readAsText(bulkUploadFile);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file-upload">Select JSON file:</Label>
        <Input
          id="file-upload"
          type="file"
          accept=".json"
          onChange={(e) => setBulkUploadFile(e.target.files[0])}
        />
      </div>
      <Button onClick={handleBulkUpload} className="w-full bg-primary-800" disabled={isUploading}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload Questions"
        )}
      </Button>
    </div>
  );
}