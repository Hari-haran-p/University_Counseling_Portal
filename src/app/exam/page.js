"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axios from 'axios';
import { Loader2 } from "lucide-react"; // Loading Icon
import { format } from 'date-fns'; // date handling
import Cookies from 'js-cookie';
import { toast } from "react-fox-toast";

const ExamPage = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [examFinished, setExamFinished] = useState(false);
    const [score, setScore] = useState(0);
    const router = useRouter();
    const [hasTakenExam, setHasTakenExam] = useState(false);
    const [isExamScheduled, setIsExamScheduled] = useState(false);
    const [hasDeclaration, setHasDeclaration] = useState(false);  // New state for declaration
    const [examEndTime, setExamEndTime] = useState(null); // Exam End Time
    const [timeRemaining, setTimeRemaining] = useState(0); // Exam Time remaining
    const [isLoading, setIsLoading] = useState(true); // Loading indicator
    const [examScheduleId, setExamScheduleId] = useState(null);
    const [examStarted, setExamStarted] = useState(false); // New state for exam start
    const [upcomingExamMessage, setUpcomingExamMessage] = useState(""); // State for upcoming exam message

    const user = JSON.parse(Cookies.get("userData") || '{}'); // Get user data
    const timerIntervalRef = useRef(null);

    useEffect(() => {
        const checkReadiness = async () => {
            if (!user?.id) {
                //  router.push('/login');  // Redirect if not logged in (optional)
                return; // Don't proceed if not logged in.
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
                    toast.error("You must make the declaration before taking the exam.", {
                        className: 'bg-primary-600 text-white rounded-3xl',
                    });
                    return;
                }
                if (examStatusResponse.data.hasTakenExam) {
                    return;
                }

                // Exam Schedule Check
                if (examScheduleResponse.data.length === 0) {
                    setIsExamScheduled(false);
                    setUpcomingExamMessage("No exam schedules found. Please contact the administrator.");
                    return;
                }

                const now = new Date();
                let closestSchedule = null;
                let smallestTimeUntilStart = Infinity; // Initialize with a large value

                for (const schedule of examScheduleResponse.data) {
                    let [datePart, timePart] = schedule.start_time.split("T");
                    let [year, month, day] = datePart.split("-").map(Number);
                    let [hour, minute, second] = timePart.replace("Z", "").split(":").map(num => Math.floor(Number(num)));
                    const start = new Date(year, month - 1, day, hour, minute, second);
                    
                    [datePart, timePart] = schedule.end_time.split("T");
                    [year, month, day] = datePart.split("-").map(Number);
                    [hour, minute, second] = timePart.replace("Z", "").split(":").map(num => Math.floor(Number(num)));
                    
                    const end = new Date(year, month - 1, day, hour, minute, second);
    
                    // Check if the current time is *within* the exam window
                    if (now >= start && now <= end) {
                        closestSchedule = schedule;  // This is the active exam
                        break; // Exit the loop - we're in an active exam!
                    }


                    const timeUntilStart = start.getTime() - now.getTime();  // milliseconds until start

                    // Find the *closest* future exam, even if others are past.
                    if (timeUntilStart > 0 && timeUntilStart < smallestTimeUntilStart) {
                        smallestTimeUntilStart = timeUntilStart;
                        closestSchedule = schedule;
                    }

                }
                if (!closestSchedule) {
                    // No future schedules.
                    setIsExamScheduled(false);
                    setUpcomingExamMessage("No upcoming exam schedules found.");
                    return;
                }


                let [datePart, timePart] = closestSchedule.start_time.split("T");
                let [year, month, day] = datePart.split("-").map(Number);
                let [hour, minute, second] = timePart.replace("Z", "").split(":").map(num => Math.floor(Number(num)));
                
                const start = new Date(year, month - 1, day, hour, minute, second);
                
                
                
                [datePart, timePart] = closestSchedule.end_time.split("T");
                [year, month, day] = datePart.split("-").map(Number);
                [hour, minute, second] = timePart.replace("Z", "").split(":").map(num => Math.floor(Number(num)));
                
                const end = new Date(year, month - 1, day, hour, minute, second);
                
                if (now < start) {
                    // It's a future exam
                    setIsExamScheduled(false);
                    setUpcomingExamMessage(
                        `The exam is scheduled to start on ${format(
                            start,
                            "MMM dd, yyyy hh:mm a"
                        )}.`
                    );
                } else if (now > end) {
                    //This case should not happen as data where taken from closest
                    setIsExamScheduled(false);
                    setUpcomingExamMessage(
                        `The exam was scheduled to end at ${format(
                            end,
                            "MMM dd, yyyy hh:mm a"
                        )}. It is no longer available.`
                    );

                }

                else {
                    // It's within the exam window!
                    setIsExamScheduled(true);
                    setExamEndTime(end);  // Set the end time.
                    setExamScheduleId(closestSchedule.id); // Set the ID
                    setUpcomingExamMessage(""); // Clear any previous message
                }

            } catch (error) {
                console.error("Error checking readiness:", error);
                toast.error("Failed to check exam readiness. Please try again later.", {
                    className: 'bg-primary-600 text-white rounded-3xl',
                });
            } finally {
                setIsLoading(false);
            }
        };

        checkReadiness();
    }, [user?.id]); // Depends on user.id

    const fetchQuestions = async () => {
        try {
            const response = await axios.get("/api/questions");
            setShuffledQuestions(response.data.sort(() => Math.random() - 0.5));
        } catch (error) {
            console.error("Error fetching questions:", error);
            toast.error("Failed to load questions.", {
                className: 'bg-primary-600 text-white rounded-3xl',
            });
        }
    };
    useEffect(() => {
        if (examEndTime && examStarted) { // Only start the timer *if* the exam has started.
            timerIntervalRef.current = setInterval(() => {
                const now = new Date();
                const timeLeft = new Date(examEndTime).getTime() - now.getTime();

                if (timeLeft <= 0) {
                    clearInterval(timerIntervalRef.current);
                    setTimeRemaining(0);
                    autoSubmitExam(true); // Auto-submit
                } else {
                    setTimeRemaining(timeLeft);
                }
            }, 1000);

            return () => clearInterval(timerIntervalRef.current);  // Cleanup on unmount/stop
        }
    }, [examEndTime, examStarted]); // Depend on examStarted


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
    const startExam = () => {
        fetchQuestions(); // Load questions when exam is started
        setExamStarted(true); // Set examStarted to true
    };

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const finishExam = async () => {
        if (!user?.id || !examScheduleId) {  // Check for examScheduleId as well
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
                examId: examScheduleId, // Send the exam schedule ID!
            });
            setExamFinished(true);
            toast.success("Exam submitted successfully!", {
                className: 'bg-primary-800 text-white rounded-3xl',
            });
        } catch (error) {
            console.error("Error storing exam result:", error);
            toast.error("Failed to store exam result.", {
                className: 'bg-primary-600 text-white rounded-3xl',
            });
        }
    };
    const autoSubmitExam = async (isTimeOut = false) => {
        if (!user?.id || !examScheduleId) {
            return;
        }

        let correctAnswersCount = 0;

        // Calculate the number of correct answers based on userAnswers
        Object.keys(userAnswers).forEach((questionId) => {
            // Check if the current question is in the shuffledQuestions array
            const question = shuffledQuestions.find((q) => q.id === questionId);

            // If the question exists and the user's answer is correct, increment the count
            if (question && userAnswers[questionId] === question.correctAnswer) {
                correctAnswersCount++;
            }
        });

        const finalScore = correctAnswersCount;

        try {
            await axios.post("/api/exam-result", {
                userId: user.id,
                score: finalScore,
                examId: examScheduleId, // Send the exam schedule ID!
            });

            if (isTimeOut) {
                toast.info("Exam auto-submitted due to time limit.", { // Different message
                    className: 'bg-primary-800 text-white rounded-3xl',
                });
            }

            setExamFinished(true);
        } catch (error) {
            console.error("Error auto-submitting exam:", error);
            toast.error("Failed to auto-submit exam.", {
                className: 'bg-primary-600 text-white rounded-3xl',
            });
        } finally {
            setExamFinished(true);  // Ensure exam is marked as finished
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
                <h2 className="text-2xl font-bold mb-4">Exam Schedule</h2>
                <p className="mb-4">{upcomingExamMessage}</p>
                <Button onClick={() => router.push("/")} className="bg-green-800 ml-3">
                    Back To Dashboard
                </Button>
            </div>
        );
    }
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