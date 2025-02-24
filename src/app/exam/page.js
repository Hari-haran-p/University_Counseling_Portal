// app/exam/page.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axios from 'axios';
import { Loader2 } from "lucide-react"; // Loading Icon
import { format } from 'date-fns'; // date handling
import Cookies from "js-cookie";

const ExamPage = () => {

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [examFinished, setExamFinished] = useState(false);
    const [score, setScore] = useState(0);
    const router = useRouter();
    const [hasTakenExam, setHasTakenExam] = useState(false);
    const [isExamScheduled, setIsExamScheduled] = useState(false);
    const [hasDeclaration, setHasDeclaration] = useState(false);
    const [examEndTime, setExamEndTime] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [examScheduleId, setExamScheduleId] = useState(null);

    const [examStarted, setExamStarted] = useState(false); // New state for exam start
    const user = JSON.parse(Cookies.get("userData"));    //REMOVE: Replace with your actual user ID retrieval mechanism
    const timerIntervalRef = useRef(null); // useRef to hold the interval ID

    useEffect(() => {
        const checkReadiness = async () => {
            if (!user?.id) {
                return;
            }
            setIsLoading(true);

            try {
                // Check declaration, exam status, and schedule in parallel
                const [declarationResponse, examStatusResponse, examScheduleResponse] = await Promise.all([
                    axios.get(`/api/check-declaration?userId=${user.id}`),
                    axios.get(`/api/check-exam-status?userId=${user.id}`),
                    axios.get("/api/exam-schedules"),
                ]);

                setHasDeclaration(declarationResponse.data.hasDeclaration);
                setHasTakenExam(examStatusResponse.data.hasTakenExam);

                if (!declarationResponse.data.hasDeclaration) {
                    alert("You must make the declaration before taking the exam.");
                    return; // Prevent further execution
                }
                if (examStatusResponse.data.hasTakenExam) {
                    return; // Prevent further execution
                }
                // Exam Schedule Check                
                if (examScheduleResponse.data.length === 0) {
                    setIsExamScheduled(false);
                    alert("No exam schedules found. Please contact the administrator.");
                    return; // Prevent further execution
                }
                const now = new Date();
                let closestSchedule = null;
                let timeDiff = Infinity;

                examScheduleResponse.data.forEach(schedule => {
                    const [datePart, timePart] = schedule.start_time.split("T");
                    const [year, month, day] = datePart.split("-").map(Number);
                    const [hour, minute, second] = timePart.replace("Z", "").split(":").map(num => Math.floor(Number(num)));
                    const start = new Date(year, month - 1, day, hour, minute, second);

                    const end = schedule.end_time
                    const diff = now.getTime() - start.getTime();
                    if (diff > 0 && diff < timeDiff) {
                        timeDiff = diff;
                        closestSchedule = schedule;
                    }
                });

                if (!closestSchedule) {
                    setIsExamScheduled(false);
                    alert("No upcoming exam schedules found.");
                    return; // Prevent further execution
                }

                let [datePart, timePart] = closestSchedule.start_time.split("T");
                let [year, month, day] = datePart.split("-").map(Number);
                let [hour, minute, second] = timePart.replace("Z", "").split(":").map(num => Math.floor(Number(num)));

                const start = new Date(year, month - 1, day, hour, minute, second);

                [datePart, timePart] = closestSchedule.end_time.split("T");
                [year, month, day] = datePart.split("-").map(Number);
                [hour, minute, second] = timePart.replace("Z", "").split(":").map(num => Math.floor(Number(num)));

                const end = new Date(year, month - 1, day, hour, minute, second);
                setExamScheduleId(closestSchedule.id)
                console.log(closestSchedule.id);

                console.log("now" + now)
                console.log("start " + start)
                console.log("end" + end)

                if (now < start) {
                    setIsExamScheduled(false);
                    alert(`The exam is scheduled to start at ${format(start, 'MMM dd, yyyy hh:mm a')}.`);
                    return; // Prevent further execution
                }
                if (now > end) {
                    setIsExamScheduled(false);
                    alert(`The exam was scheduled to end at ${format(end, 'MMM dd, yyyy hh:mm a')}. It is no longer available.`);
                    return; // Prevent further execution
                }
                setIsExamScheduled(true);
                setExamEndTime(end);
                //fetchQuestions();
            } catch (error) {
                console.error("Error checking readiness:", error);
                alert("Failed to check exam readiness. Please try again later.");
            } finally {
                setIsLoading(false);  // Set loading to false
            }
        };

        checkReadiness();

    }, [user?.id]);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get("/api/questions");
            setShuffledQuestions(response.data.sort(() => Math.random() - 0.5));
            console.log(response.data.sort(() => Math.random() - 0.5));
        } catch (error) {
            console.error("Error fetching questions:", error);
            alert("Failed to load questions.");
        }
    };

    //Timer useEffect
    useEffect(() => {
        if (examEndTime && examStarted) {
            timerIntervalRef.current = setInterval(() => {
                const now = new Date();
                const timeLeft = examEndTime.getTime() - now.getTime();

                if (timeLeft <= 0) {
                    clearInterval(timerIntervalRef.current);
                    setTimeRemaining(0);
                    autoSubmitExam(true);
                } else {
                    setTimeRemaining(timeLeft);
                }
            }, 1000);

            return () => clearInterval(timerIntervalRef.current); // Cleanup on unmount
        }
    }, [examEndTime, examStarted]);

    const handleAnswer = (selectedAnswer) => {
        console.log(userAnswers);
        console.log(shuffledQuestions[currentQuestionIndex]);

        setUserAnswers({ ...userAnswers, [shuffledQuestions[currentQuestionIndex].id]: selectedAnswer });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            finishExam();
        }
    };
  const startExam = () => {
    fetchQuestions(); // Load questions when exam is started
    setExamStarted(true);
  };
    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    const finishExam = async () => {
        if (!user?.id || !examScheduleId) {
            return;
        }
        let correctAnswersCount = 0;
        shuffledQuestions.forEach((question) => {
            if (userAnswers[question.id] === question.correctAnswer) {
                correctAnswersCount++;
            }
        });
        const finalScore = correctAnswersCount;
        try {
            await axios.post("/api/exam-result", {
                userId: user.id,
                score: finalScore,
                examId: examScheduleId
            });
            setExamFinished(true);
        } catch (error) {
            console.error("Error storing exam result:", error);
            alert("Failed to store exam result.");
        }
    };

    const autoSubmitExam = async (isTimeOut = false) => {
        if (!user?.id || !examScheduleId) {
            return;
        }

        let correctAnswersCount = 0;
        shuffledQuestions.forEach((question) => {
            if (userAnswers[question.id] === question.correctAnswer) {
                correctAnswersCount++;
            }
        });

        const finalScore = correctAnswersCount;

        try {
            await axios.post("/api/exam-result", {
                userId: user.id,
                score: finalScore,
                examId: examScheduleId,
            });

            if (isTimeOut) {
                alert("Exam auto-submitted due to time limit.");
            }

            setExamFinished(true);
        } catch (error) {
            console.error("Error auto-submitting exam:", error);
            alert("Failed to auto-submit exam.");
        } finally {
            setExamFinished(true); // Ensure exam is marked as finished
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 text-center h-full w-full flex flex-col items-center justify-center">
                <Loader2 className="inline-block animate-spin" />
                <p>Loading...</p>
            </div>
        );
    }
    if (!hasDeclaration) {
        return (
            <div className="container mx-auto py-10">
                <h2 className="text-2xl font-bold mb-4">Declaration Required</h2>
                <p className="mb-4">You must make the declaration before taking the exam.</p>
                <Button onClick={() => router.push('/apply')} className="bg-blue-800 ml-3">
                    Go to Profile
                </Button>
            </div>
        );
    }
    if (hasTakenExam) {
        return (
            <div className="container mx-auto py-10">
                <h2 className="text-2xl font-bold mb-4">Exam Already Taken</h2>
                <p className="mb-4">You have already taken this exam and can not retake it.</p>
                <Button onClick={() => router.push('/')} className="bg-green-800 ml-3">
                    Back To Dashboard
                </Button>
            </div>
        );
    }
    if (!isExamScheduled) {
        return (
            <div className="container mx-auto py-10">
                <h2 className="text-2xl font-bold mb-4">Exam Not Scheduled</h2>
                <p className="mb-4">This exam is not currently scheduled. Please check back later.</p>
                <Button onClick={() => router.push('/')} className="bg-green-800 ml-3">
                    Back To Dashboard
                </Button>
            </div>
        );
    }

    // Show "Start Exam" button before the exam is started
    if (!examStarted) {
        return (
            <div className="container mx-auto py-10 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to start the exam?</h2>
                <p className="mb-4">Click the button below to begin.</p>
                <Button onClick={startExam} className="bg-primary-800">
                    Start Exam
                </Button>
            </div>
        );
    }

    if (shuffledQuestions.length === 0) {
        return <div className="container mx-auto py-10">Loading questions...</div>;
    }

    if (examFinished) {
        return (
            <div className="container mx-auto py-10">
                <h2 className="text-2xl font-bold mb-4">Exam Completed</h2>
                <p className="mb-4">Thank you for completing the exam.</p>
                <Button onClick={() => router.push('/')} className="bg-green-800 ml-3">
                    Back To Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Exam</h1>
            <div className="mb-4">
                Time Remaining: {formatTime(timeRemaining)}
            </div>
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