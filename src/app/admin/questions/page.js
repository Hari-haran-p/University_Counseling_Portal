// app/admin/questions/page.js
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  const [bulkUploadFile, setBulkUploadFile] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get("/api/questions");
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Failed to load questions.");
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`/api/questions/${id}`);
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question.");
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({ ...newQuestion, [name]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const addQuestion = async () => {
    try {
      const response = await axios.post("/api/questions", {
        question: newQuestion.question,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer,
      });
      if (response.status === 201) {
        alert("Question added successfully!");
        setNewQuestion({
          question: "",
          options: ["", "", "", ""],
          correctAnswer: "",
        });
        fetchQuestions();
      }
    } catch (error) {
      console.error("Error adding question:", error);
      alert("Failed to add question.");
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFile) {
      alert("Please select a file to upload.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const questions = JSON.parse(e.target.result);
        await axios.post("/api/questions/bulk", questions);
        alert("Questions uploaded successfully!");
        setBulkUploadFile(null);
        fetchQuestions();
      } catch (error) {
        console.error("Error uploading questions:", error);
        alert("Failed to upload questions.");
      }
    };

    reader.readAsText(bulkUploadFile);
  };


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Admin - Question Management</h1>

      {/* Question List */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Question List</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium">{question.id}</TableCell>
                <TableCell>{question.question}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Options:</p>
                        <ul className="list-disc pl-4">
                          {question.options.map((option, index) => (
                            <li key={index} className="text-sm">
                              {option}
                            </li>
                          ))}
                        </ul>
                        <p className="text-sm font-medium">Correct Answer:</p>
                        <p className="text-sm">{question.correctAnswer}</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => deleteQuestion(question.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Add Question Form */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Add New Question</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="question">Question:</Label>
            <Input
              type="text"
              id="question"
              name="question"
              value={newQuestion.question}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div>
            <Label>Options:</Label>
            {newQuestion.options.map((option, index) => (
              <div key={index} className="mb-2">
                <Input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full"
                  placeholder={`Option ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="correctAnswer">Correct Answer:</Label>
            <Input
              type="text"
              id="correctAnswer"
              name="correctAnswer"
              value={newQuestion.correctAnswer}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <Button onClick={addQuestion} className="bg-primary-800">
            Add Question
          </Button>
        </div>
      </div>

      {/* Bulk Upload */}
      <div>
        <h3 className="text-lg font-medium mb-2">Bulk Upload Questions</h3>
        <div className="flex items-center space-x-2">
          <Input
            type="file"
            accept=".json"
            onChange={(e) => setBulkUploadFile(e.target.files[0])}
          />
          <Button onClick={handleBulkUpload} className="bg-primary-800">
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionsPage;