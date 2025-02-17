// app/admin/results/page.js
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminResultsPage = () => {
  const [examResults, setExamResults] = useState([]);

  useEffect(() => {
    fetchExamResults();
  }, []);

  const fetchExamResults = async () => {
    try {
      const response = await axios.get("/api/exam-result");
      setExamResults(response.data);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      alert("Failed to load exam results.");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Admin - Exam Results</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>User Email</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Taken At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {examResults.map((result) => (
            <TableRow key={result.result_id}>
              <TableCell>{result.user_id}</TableCell>
              <TableCell>{result.user_name}</TableCell>
              <TableCell>{result.user_email}</TableCell>
              <TableCell>{result.score}</TableCell>
              <TableCell>{new Date(result.taken_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminResultsPage;