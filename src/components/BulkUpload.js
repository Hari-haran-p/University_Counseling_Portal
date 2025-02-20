"use client"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function BulkUpload({ onUploadComplete }) {
  const [bulkUploadFile, setBulkUploadFile] = useState(null)

  const handleBulkUpload = async () => {
    if (!bulkUploadFile) {
      alert("Please select a file to upload.")
      return
    }

    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const questions = JSON.parse(e.target.result)
        await axios.post("/api/questions/bulk", questions)
        alert("Questions uploaded successfully!")
        setBulkUploadFile(null)
        onUploadComplete()
      } catch (error) {
        console.error("Error uploading questions:", error)
        alert("Failed to upload questions.")
      }
    }

    reader.readAsText(bulkUploadFile)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file-upload">Select JSON file:</Label>
        <Input id="file-upload" type="file" accept=".json" onChange={(e) => setBulkUploadFile(e.target.files[0])} />
      </div>
      <Button onClick={handleBulkUpload} className="w-full bg-primary-800">
        Upload Questions
      </Button>
    </div>
  )
}

