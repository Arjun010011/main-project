"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

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
        setTimeLeft(testInfo.duraton ? testInfo.duration : 10 * 60); // Convert minutes to seconds
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

  // Timer effect
  useEffect(() => {
    if (!testStarted || !timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

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
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    try {
      setIsSubmitting(true);

      const response = await axios.post("/api/classRoom/submitTest", {
        questionPaperId: testId,
        answers: answers,
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
    }
  };

  const startTest = () => {
    setTestStarted(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {testData?.name}
              </h1>

              <div className="flex justify-center items-center gap-6 text-sm text-gray-600 dark:text-gray-300 mb-6">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>Duration: {testData?.duration || "N/A"} minutes</span>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
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
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sticky top-4">
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
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 rounded text-xs font-medium transition-all duration-200 ${
                        isCurrent
                          ? "bg-blue-500 text-white"
                          : isAnswered
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
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
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
              {/* Question */}
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

                {/* Options */}
                <div className="space-y-3">
                  {["A", "B", "C", "D"].map((option) => {
                    const optionText =
                      currentQuestion.question?.[`Option_${option}`];
                    const isSelected = answers[currentQuestion.id] === option;

                    return (
                      <button
                        key={option}
                        onClick={() =>
                          handleAnswerSelect(
                            currentQuestion.id,
                            "Option_" + option,
                          )
                        }
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                              isSelected
                                ? "border-blue-500 bg-blue-500 text-white"
                                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {option}
                          </div>
                          <span className="text-gray-900 dark:text-white">
                            {optionText}
                          </span>
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
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitTest}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Test"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2"
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
