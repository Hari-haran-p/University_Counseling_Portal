// app/exam/page.js
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axios from 'axios';

const ExamPage = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [examFinished, setExamFinished] = useState(false);
    const router = useRouter();
    const [hasTakenExam, setHasTakenExam] = useState(false);
    const user = { id: 9 }; //REMOVE: Replace with your actual user ID retrieval mechanism

    useEffect(() => {
        const checkExamStatus = async () => {
            if (!user?.id) {
                return;
            }
            try {
                const response = await axios.get(`/api/check-exam-status?userId=${user.id}`);
                setHasTakenExam(response.data.hasTakenExam);
                if (!response.data.hasTakenExam) {
                    fetchQuestions();
                }
            } catch (error) {
                console.error("Error checking exam status:", error);
                alert("Failed to check exam status.");
            }
        };

        const fetchQuestions = async () => {
            try {
                const response = await axios.get("/api/questions");
                setShuffledQuestions(response.data.sort(() => Math.random() - 0.5));
            } catch (error) {
                console.error("Error fetching questions:", error);
                alert("Failed to load questions.");
            }
        };
        checkExamStatus();

    }, [user?.id]);

    const handleAnswer = (selectedAnswer) => {
        setUserAnswers({ ...userAnswers, [shuffledQuestions[currentQuestionIndex].id]: selectedAnswer });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            finishExam();
        }
    };

    const finishExam = async () => {
        if (!user?.id) {
            return;
        }

        let correctAnswersCount = 0;
        shuffledQuestions.forEach((question) => {
            if (userAnswers[question.id] === question.correctAnswer) {
                correctAnswersCount++;
            }
        });

        const finalScore = correctAnswersCount;

        setExamFinished(true);

        try {
            await axios.post("/api/exam-result", {
                userId: user.id,
                score: finalScore,
            });
        } catch (error) {
            console.error("Error storing exam result:", error);
            alert("Failed to store exam result.");
        }
    };

    if (hasTakenExam) {
        return (
            <div className="container mx-auto py-10">
                <h2 className="text-2xl font-bold mb-4">Exam Already Taken</h2>
                <p className="mb-4">You have already taken this exam and can not retake it.</p>
                <Button onClick={() => router.push('/dashboard')} className="bg-green-800 ml-3">
                    Back To Dashboard
                </Button>
            </div>
        );
    }

    if (shuffledQuestions.length === 0) {
        return <div>Loading questions...</div>;
    }

    if (examFinished) {
        return (
            <div className="container mx-auto py-10">
                <h2 className="text-2xl font-bold mb-4">Exam Completed</h2>
                <p className="mb-4">Thank you for completing the exam.</p>
                <Button onClick={() => router.push('/dashboard')} className="bg-green-800 ml-3">
                    Back To Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Exam</h1>
            <div className="mb-4">
                Question {currentQuestionIndex + 1} / {shuffledQuestions.length}
            </div>
            <div className="mb-4">{shuffledQuestions[currentQuestionIndex]?.question}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {shuffledQuestions[currentQuestionIndex]?.options?.map((option) => (
                    <Button
                        key={option}
                        className={`text-black bg-gray-200 hover:bg-gray-300 ${userAnswers[shuffledQuestions[currentQuestionIndex].id] === option ? "bg-green-500 text-white" : ""
                            }`}
                        onClick={() => handleAnswer(option)}
                    >
                        {option}
                    </Button>
                ))}
            </div>
            <Button onClick={handleNextQuestion} className="bg-primary-800">
                {currentQuestionIndex === shuffledQuestions.length - 1 ? "Finish Exam" : "Next Question"}
            </Button>
        </div>
    );
};

export default ExamPage;