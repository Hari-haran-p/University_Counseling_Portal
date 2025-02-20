"use client"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AddQuestionForm({ onQuestionAdded }) {
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewQuestion({ ...newQuestion, [name]: value })
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuestion.options]
    newOptions[index] = value
    setNewQuestion({ ...newQuestion, options: newOptions })
  }

  const addQuestion = async () => {
    try {
      const response = await axios.post("/api/questions", newQuestion)
      if (response.status === 201) {
        alert("Question added successfully!")
        setNewQuestion({
          question: "",
          options: ["", "", "", ""],
          correctAnswer: "",
        })
        onQuestionAdded()
      }
    } catch (error) {
      console.error("Error adding question:", error)
      alert("Failed to add question.")
    }
  }

  return (
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

      <Button onClick={addQuestion} className="w-full bg-primary-800">
        Add Question
      </Button>
    </div>
  )
}

