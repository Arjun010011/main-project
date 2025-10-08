"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import storeUser from "@/lib/store/userStore";

export default function TestInterface() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId;
  const [testData, setTestData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [showSubmissionWarning, setShowSubmissionWarning] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);

  // Tab switching monitoring states
  const [isTabActive, setIsTabActive] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [lastSwitchTime, setLastSwitchTime] = useState(null);
  const [autoSubmissionTriggered, setAutoSubmissionTriggered] = useState(false);
  const [testLocked, setTestLocked] = useState(false); // New state to lock the test
  const warningTimeoutRef = useRef(null);

  // Final submission function
  const submitTestFinal = async () => {
    try {
      setIsSubmitting(true);
      setTestLocked(true); // Lock the test immediately
      setShowSubmissionWarning(false);
      setShowTabWarning(false);

      const response = await axios.post("/api/classRoom/submitTest", {
        questionPaperId: testId,
        answers: answers,
        tabSwitchCount: tabSwitchCount,
      });
      if (response.data.success) {
        const submission = response.data.submission;
        alert(
          `Test submitted successfully!\n\nScore: ${submission.totalMarksObtained}/${submission.totalMarks} (${submission.percentage}%)`,
        );
        router.push("/studentDashboard");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to submit test. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
      setTestLocked(false);
    }
  };

  useEffect(() => {
    const loadTestData = async () => {
      try {
        setLoading(true);
        setError(null);
        // First verify access and get test info
        const accessResponse = await axios.post(
          "/api/classRoom/verifyTestAccess",
          {
            questionPaperId: testId,
          },
        );
        if (!accessResponse.data.success) {
          throw new Error("Access denied");
        }
        // Get the actual test questions
        const testResponse = await axios.post(
          "/api/classRoom/fetchQuestionPaper",
          {
            questionPaperId: testId,
          },
        );
        const testInfo = accessResponse.data.testInfo;
        const questionsData = testResponse.data.questionPaper.questions || [];
        setTestData(testInfo);
        setQuestions(questionsData);

        setTimeLeft(testInfo.duration ? testInfo.duration * 3600 : 100 * 60);
      } catch (error) {
        console.error("Error loading test:", error);
        const errorMessage =
          error.response?.data?.error || "Failed to load test";
        setError(errorMessage);
        setTimeout(() => {
          router.push("/studentDashboard");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };
    if (testId) {
      loadTestData();
    }
  }, [testId, router]);

  // Tab switching and focus monitoring
  useEffect(() => {
    if (!testStarted || testLocked) return;

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabActive(false);
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        setLastSwitchTime(new Date());
        setShowTabWarning(true);

        // **AUTO-SUBMIT ON 3RD VIOLATION + NAVIGATE TO LAST QUESTION**
        if (newCount >= 3 && !autoSubmissionTriggered) {
          setAutoSubmissionTriggered(true);
          setTestLocked(true);
          // Navigate to last question (where submit button is)
          setCurrentQuestionIndex(questions.length - 1);
          submitTestFinal();
        }

        // Clear any existing timeout
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }

        // Auto-hide warning after 10 seconds if user comes back
        warningTimeoutRef.current = setTimeout(() => {
          setShowTabWarning(false);
        }, 10000);
      } else {
        setIsTabActive(true);
        setShowTabWarning(false);
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
      }
    };

    // Handle window focus/blur
    const handleWindowBlur = () => {
      if (!document.hidden) {
        setIsTabActive(false);
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        setLastSwitchTime(new Date());
        setShowTabWarning(true);

        // **AUTO-SUBMIT ON 3RD VIOLATION + NAVIGATE TO LAST QUESTION**
        if (newCount >= 3 && !autoSubmissionTriggered) {
          setAutoSubmissionTriggered(true);
          setTestLocked(true);
          // Navigate to last question (where submit button is)
          setCurrentQuestionIndex(questions.length - 1);
          submitTestFinal();
        }
      }
    };

    const handleWindowFocus = () => {
      setIsTabActive(true);
      setShowTabWarning(false);
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };

    // Prevent common keyboard shortcuts for opening tabs/windows
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        const preventedKeys = ["t", "n", "w", "r", "shift+n", "shift+t"];
        const keyPressed = e.shiftKey
          ? `shift+${e.key.toLowerCase()}`
          : e.key.toLowerCase();
        if (preventedKeys.includes(keyPressed)) {
          e.preventDefault();
          e.stopPropagation();
          setShowTabWarning(true);
          setTimeout(() => setShowTabWarning(false), 3000);
          return false;
        }
      }
      if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu);

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue =
        "Are you sure you want to leave the test? Your progress may be lost.";
      return "Are you sure you want to leave the test? Your progress may be lost.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [
    testStarted,
    tabSwitchCount,
    autoSubmissionTriggered,
    questions.length,
    testLocked,
    submitTestFinal,
  ]);

  // Timer effect
  useEffect(() => {
    if (!testStarted || !timeLeft || testLocked) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          setTestLocked(true);
          setCurrentQuestionIndex(questions.length - 1);
          submitTestFinal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted, timeLeft, testLocked, questions.length, submitTestFinal]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (questionId, selectedAnswer) => {
    if (testLocked) return; // Prevent answer changes when locked
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswer,
    }));
  };

  const handleNextQuestion = () => {
    if (testLocked) return; // Prevent navigation when locked
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (testLocked) return; // Prevent navigation when locked
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    if (testLocked) return; // Prevent multiple submissions

    const unanswered = questions.filter((question) => !answers[question.id]);
    if (unanswered.length > 0) {
      setUnansweredQuestions(unanswered);
      setShowSubmissionWarning(true);
      return;
    }
    setTestLocked(true);
    submitTestFinal();
  };

  const handleGoToUnanswered = (questionIndex) => {
    if (testLocked) return; // Prevent navigation when locked
    setCurrentQuestionIndex(questionIndex);
    setShowSubmissionWarning(false);
  };

  const handleQuestionNavigation = (index) => {
    if (testLocked) return; // Prevent navigation when locked
    setCurrentQuestionIndex(index);
  };

  const startTest = () => {
    setTestStarted(true);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        console.log("Fullscreen request failed");
      });
    }
  };

  const dismissTabWarning = () => {
    setShowTabWarning(false);
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen select-none">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-screen h-screen select-none">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Test
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6 select-none">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {testData?.name}
              </h1>
              <div className="flex justify-center items-center gap-6 text-sm text-gray-600 dark:text-gray-300 mb-6">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>Duration: {testData?.duration || "N/A"} hour</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Total Questions: {questions.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Total Marks: {testData?.totalMarks || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Test Instructions
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-6">
                <li>• Read each question carefully before answering</li>
                <li>• You can only select one answer per question</li>
                <li>
                  • You can navigate between questions using the navigation
                  buttons
                </li>
                <li>• The test will automatically submit when time runs out</li>
                <li>• Do not refresh the page during the test</li>
                <li>• Once you start, you cannot pause the test</li>
                <li className="text-red-600 dark:text-red-400 font-semibold">
                  • Do not switch tabs or open other applications during the
                  test
                </li>
                <li className="text-red-600 dark:text-red-400 font-semibold">
                  • Tab switching is monitored - 3 violations will auto-submit
                  your test
                </li>
              </ul>
            </div>
            <div className="mt-8 flex justify-center">
              <Button className="px-8 py-3 text-lg" onClick={startTest}>
                Start Test Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = (answeredQuestions / questions.length) * 100;

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-800 select-none relative ${testLocked ? "pointer-events-none" : ""}`}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        KhtmlUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
      }}
    >
      {/* Simple Tab Switch Warning - Non-blocking */}
      {showTabWarning && !testLocked && (
        <div className="fixed top-4 right-4 z-30 max-w-sm">
          <div className="bg-red-500 text-white p-3 rounded-lg shadow-lg animate-in slide-in-from-right-full duration-300">
            <div className="flex items-center gap-2">
              <EyeOff size={16} />
              <span className="text-sm font-medium">
                Tab switch detected! Violation {tabSwitchCount}/3
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Simple Red Message at Bottom for Auto-Submission */}
      {autoSubmissionTriggered && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
          <div className="bg-red-600 text-white text-center py-4 px-6">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle size={20} />
              <span className="text-lg font-bold">
                Test auto-submitted due to excessive tab switching violations!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Test Locked Overlay */}
      {testLocked && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center pointer-events-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 text-center max-w-md mx-4">
            <Loader className="animate-spin mx-auto mb-4" size={32} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Submitting Test...
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Please wait while your test is being submitted.
            </p>
          </div>
        </div>
      )}

      {/* Submission Warning Modal */}
      {showSubmissionWarning && !testLocked && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Unanswered Questions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    You have {unansweredQuestions.length} unanswered question
                    {unansweredQuestions.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  The following questions are not answered:
                </p>
                <div className="max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="space-y-2">
                    {unansweredQuestions.map((question, index) => {
                      const questionIndex = questions.findIndex(
                        (q) => q.id === question.id,
                      );
                      return (
                        <button
                          key={question.id}
                          onClick={() => handleGoToUnanswered(questionIndex)}
                          className="flex items-center gap-2 text-sm text-left w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded text-xs font-medium flex items-center justify-center">
                            {questionIndex + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 truncate">
                            {question.question?.Question ||
                              `Question ${questionIndex + 1}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setShowSubmissionWarning(false)}
                  variant="outline"
                  className="w-full"
                >
                  Go Back to Answer
                </Button>
                <Button
                  onClick={submitTestFinal}
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isSubmitting ? "Submitting..." : "Submit Anyway"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with timer and progress */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {testData?.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {/* Tab Switch Counter */}
              {tabSwitchCount > 0 && (
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    tabSwitchCount >= 2
                      ? "bg-red-200 dark:bg-red-800/50 border-2 border-red-500 animate-pulse"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  <EyeOff size={14} className="text-red-600" />
                  <span
                    className={`text-sm font-bold ${
                      tabSwitchCount >= 2
                        ? "text-red-800 dark:text-red-200"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    Violations: {tabSwitchCount}/3
                    {tabSwitchCount >= 2 && " ⚠️"}
                  </span>
                </div>
              )}

              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {answeredQuestions}/{questions.length}
                </span>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock
                  size={20}
                  className={
                    timeLeft <= 300
                      ? "text-red-500"
                      : "text-gray-600 dark:text-gray-300"
                  }
                />
                <span
                  className={
                    timeLeft <= 300
                      ? "text-red-500"
                      : "text-gray-900 dark:text-white"
                  }
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Panel */}
          <div className="lg:col-span-1">
            <div
              className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sticky top-4 ${testLocked ? "opacity-50" : ""}`}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Question Navigator
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const isAnswered = answers[question.id];
                  const isCurrent = index === currentQuestionIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionNavigation(index)}
                      disabled={testLocked}
                      className={`w-8 h-8 rounded text-xs font-medium transition-all duration-200 select-none ${
                        testLocked
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                      } ${
                        isCurrent
                          ? "bg-blue-500 text-white shadow-md"
                          : isAnswered
                            ? "bg-green-500 text-white shadow-sm"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main test content */}
          <div className="lg:col-span-3">
            <div
              className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 ${testLocked ? "opacity-50" : ""}`}
            >
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    Question {currentQuestionIndex + 1}
                  </span>
                  {answers[currentQuestion.id] && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  {currentQuestion.question?.Question}
                </h2>

                <div className="space-y-3">
                  {["A", "B", "C", "D"].map((option) => {
                    const optionText =
                      currentQuestion.question?.[`Option_${option}`];
                    const isSelected =
                      answers[currentQuestion.id] === "Option_" + option;

                    return (
                      <button
                        key={option}
                        onClick={() =>
                          handleAnswerSelect(
                            currentQuestion.id,
                            "Option_" + option,
                          )
                        }
                        disabled={testLocked}
                        className={`group w-full text-left p-4 rounded-lg border-2 transition-all duration-200 select-none ${
                          testLocked
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                        } ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                              isSelected
                                ? "border-blue-500 bg-blue-500 text-white shadow-md transform scale-110"
                                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 group-hover:border-blue-400 group-hover:text-blue-500"
                            }`}
                          >
                            {option}
                          </div>
                          <span
                            className={`flex-1 transition-all duration-200 ${
                              isSelected
                                ? "text-gray-900 dark:text-white font-semibold"
                                : "text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white"
                            }`}
                          >
                            {optionText}
                          </span>
                          {isSelected && (
                            <div className="flex-shrink-0 ml-2">
                              <CheckCircle
                                size={20}
                                className="text-blue-500 animate-pulse"
                              />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0 || testLocked}
                  className="flex items-center gap-2 select-none"
                >
                  <ArrowLeft size={16} />
                  Previous
                </Button>
                <div className="flex gap-2">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitTest}
                      disabled={isSubmitting || testLocked}
                      className={`select-none ${
                        testLocked
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader size={16} className="animate-spin" />
                          Submitting...
                        </div>
                      ) : (
                        "Submit Test"
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      disabled={testLocked}
                      className="flex items-center gap-2 select-none"
                    >
                      Next
                      <ArrowRight size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
