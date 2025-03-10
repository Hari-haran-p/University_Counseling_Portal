import React, { useState, useEffect, useRef } from "react";
import "../app/Chatbot.css";
import Image from "next/image";
import { MessageCircle, X, ArrowLeft, Send, Loader } from "lucide-react";

const chatbotData = {
  welcome: {
    message: "Hey there! 👋 How can I assist you today?",
    options: [
      { label: "Registration & Login", value: "registration" },
      { label: "Hall Ticket & Exam Scheduling", value: "hall_ticket" },
      { label: "Exam Process & Rules", value: "exam_process" },
      { label: "Results & Cutoff Details", value: "results" },
      { label: "Seat Availability & Counseling", value: "counseling" },
    ],
  },
  registration: {
    message: "Got it! What do you need help with? 🤔",
    options: [
      { label: "How do I register for the exam?", value: "q1" },
      { label: "What details are needed for registration?", value: "q2" },
      { label: "How do I log in to my portal?", value: "q3" },
      { label: "Can I update my details later?", value: "q4" },
    ],
  },
  hall_ticket: {
    message: "Sure! What do you need help with? 🎟",
    options: [
      { label: "When will my hall ticket be available?", value: "q5" },
      { label: "How do I download my hall ticket?", value: "q6" },
      { label: "What is my exam date and time?", value: "q7" },
      { label: "Can I reschedule my exam date?", value: "q8" },
      { label: "What if I don't receive my hall ticket?", value: "q9" },
    ],
  },
  exam_process: {
    message: "Got it! What do you need to know about the exam? 📖",
    options: [
      { label: "How do I start my online exam?", value: "q10" },
      { label: "What is the exam duration and pattern?", value: "q11" },
      { label: "Can I take the exam on my phone?", value: "q12" },
      { label: "What happens if my internet disconnects?", value: "q13" },
      { label: "Are there any rules to follow?", value: "q14" },
    ],
  },
  results: {
    message: "Exam results? Let's check! 📊",
    options: [
      { label: "Where can I check my results?", value: "q15" },
      { label: "How is my score calculated?", value: "q16" },
      { label: "Can I request a re-evaluation?", value: "q17" },
    ],
  },
  counseling: {
    message: "Counseling and seat availability? Here you go! 🎓",
    options: [
      { label: "How do I check seat availability?", value: "q18" },
      { label: "Am I eligible for my preferred course?", value: "q19" },
      { label: "How do I apply for counseling?", value: "q20" },
      { label: "Can I change my selected course?", value: "q21" },
      { label: "How will I get updates on my counseling status?", value: "q22" },
    ],
  },

  // Answers
  q1: "✨ Go to the registration page, enter details, upload documents, and submit!",
  q2: "📌 You'll need name, email, phone number, 12th-grade marks, and other details.",
  q3: "🔐 After registration, you'll receive login credentials via email.",
  q4: "⚠️ You can update phone number and password, but other details need admin approval.",
  q5: "🎟 Hall tickets will be available in your portal once the exam is scheduled.",
  q6: "📥 Log in to your portal, go to the 'Hall Ticket' section, and download it.",
  q7: "📅 Your exam date and time will be mentioned in your hall ticket.",
  q8: "🔄 No, once scheduled, the exam date cannot be changed.",
  q9: "❓ Check your portal. If missing, contact support immediately.",
  q10: "🖥 Log in to your portal and click 'Start Exam' at the scheduled time.",
  q11: "⏳ The exam is 90 minutes long and consists of multiple-choice questions (MCQs).",
  q12: "📱 It's recommended to take the exam on a laptop/desktop for best experience.",
  q13: "⚠️ Your answers will be auto-saved. Log in again and continue within time.",
  q14: "📜 Follow the rules mentioned in your hall ticket to avoid disqualification.",
  q15: "📊 Results will be displayed in your student portal under 'Results' section.",
  q16: "🧮 Score is based on correct answers, 12th-grade cutoff, and community quota.",
  q17: "🔍 No, the exam is auto-evaluated, and re-evaluation is not allowed.",
  q18: "📍 Log in and go to 'Seat Availability' section to view updates.",
  q19: "✅ Eligibility depends on your exam score, 12th-grade cutoff, and community quota.",
  q20: "📝 Once results are published, go to 'Counseling' and apply online.",
  q21: "🔄 No, once allocated and confirmed, course changes are not allowed.",
  q22: "📩 Updates will be available in your student portal and via email.",
};

const Chatbot = () => {
  const [history, setHistory] = useState([{ sender: "bot", message: "welcome" }]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentOptions, setCurrentOptions] = useState(chatbotData["welcome"].options);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [history, isOpen]);

  const handleOptionClick = (value) => {
    const optionText = currentOptions.find(option => option.value === value)?.label || "";
    
    setHistory((prev) => [...prev, { 
      sender: "user", 
      message: optionText
    }]);
    
    setIsTyping(true);

    setTimeout(() => {
      setHistory((prev) => [...prev, { 
        sender: "bot", 
        message: chatbotData[value]?.message || chatbotData[value] 
      }]);

      if (chatbotData[value]?.options) {
        setCurrentOptions(chatbotData[value].options);
      } else {
        // Show welcome options after answer is shown
        setCurrentOptions(chatbotData["welcome"].options);
      }

      setIsTyping(false);
    }, 1000);
  };

  const handleBackClick = () => {
    if (history.length > 1) {
      // Remove the last two entries (user question and bot answer)
      const newHistory = history.slice(0, -2);
      setHistory(newHistory);
      
      // Get the last bot message to determine options
      const lastBotEntry = newHistory.filter(msg => msg.sender === "bot").pop();
      const lastBotMessage = lastBotEntry?.message || "welcome";
      
      // Set the options based on the last bot message
      setCurrentOptions(chatbotData[lastBotMessage]?.options || chatbotData["welcome"].options);
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset to welcome message when opening
      setHistory([{ sender: "bot", message: "welcome" }]);
      setCurrentOptions(chatbotData["welcome"].options);
    }
  };

  // Use an emoji or text fallback in case the image fails to load
  const botAvatar = () => {
    return (
      <div className="chatbot-avatar">
        {/* Using a div with emoji as fallback */}
        <div className="bot-emoji">🤖</div>
      </div>
    )
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <div className="chatbot-popup">
          <span>Need help with your exam process?</span>
        </div>
      )}

      <button 
        className={`chatbot-toggle-button ${isOpen ? 'active' : ''}`} 
        onClick={toggleChatbot}
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <MessageCircle size={24} />
        )}
      </button>

      {isOpen && (
        <div className="chatbot-content">
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              {botAvatar()}
              <span>University Assistant</span>
            </div>
            <button className="chatbot-close-button" onClick={() => setIsOpen(false)} aria-label="Close chatbot">
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages">
            {history.map((entry, index) => (
              <div key={index} className={`chat-message ${entry.sender === "user" ? "user-message" : "bot-message"}`}>
                {entry.sender === "bot" && chatbotData[entry.message] ? (
                  chatbotData[entry.message].message
                ) : (
                  entry.message
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="chatbot-typing">
                <Loader size={16} className="typing-indicator" />
                <span>Assistant is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {history.length > 1 && (
            <button className="chatbot-back-button" onClick={handleBackClick} aria-label="Go back">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          <div className="chatbot-options-container">
            <div className="chatbot-options">
              {!isTyping &&
                currentOptions.map((option) => (
                  <button
                    key={option.value}
                    className="chatbot-option-button"
                    onClick={() => handleOptionClick(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;