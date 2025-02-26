"use client"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-fox-toast";
import { Loader2 } from "lucide-react"; // Import Loader2


export function AddQuestionForm({ onQuestionAdded }) {
    const [newQuestion, setNewQuestion] = useState({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
    });
    const [isLoading, setIsLoading] = useState(false); // Add loading state

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
        // Validation: Check if the correct answer is one of the options
        if (!newQuestion.options.includes(newQuestion.correctAnswer)) {
            toast.error("The correct answer must be one of the provided options.", {
                className: 'bg-primary-600 text-white rounded-3xl',
            });
            return; // Stop the function if validation fails
        }

        setIsLoading(true); // Set loading state
        try {
            const response = await axios.post("/api/questions", newQuestion);
            if (response.status === 201) {
                toast.success("Question added successfully!", {
                    className: 'bg-primary-800 text-white rounded-3xl',
                });
                setNewQuestion({
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: "",
                });
                onQuestionAdded();
            }
        } catch (error) {
            console.error("Error adding question:", error);
            toast.error("Failed to add question.", {
                className: 'bg-primary-600 text-white rounded-3xl',
            });
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

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
            <Button onClick={addQuestion} className="bg-primary-800" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                    </>
                ) : (
                    "Add Question"
                )}
            </Button>
        </div>
    );
}