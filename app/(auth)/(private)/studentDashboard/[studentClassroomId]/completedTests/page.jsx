"use client";
import { useEffect, useState } from "react";
import { Loader, Award, Clock, Calendar, TrendingUp } from "lucide-react";
import { useParams } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import StudentSidebar from "../_components/StudentSidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export default function CompletedTestsPage() {
  const params = useParams();
  const studentClassroomId = params.studentClassroomId;
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "/api/classRoom/getStudentSubmissions",
          {
            classroomId: studentClassroomId,
          }
        );

        if (response.data.success) {
          setSubmissions(response.data.submissions);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setError("Failed to load completed tests");
      } finally {
        setLoading(false);
      }
    };

    if (studentClassroomId) {
      fetchSubmissions();
    }
  }, [studentClassroomId]);

  // --- Analytics Calculations ---
  const totalTests = submissions.length;
  const averageScore =
    totalTests > 0
      ? Math.round(
          (submissions.reduce((sum, s) => sum + s.percentage, 0) / totalTests) *
            100
        ) / 100
      : 0;
  const highestScore =
    totalTests > 0 ? Math.max(...submissions.map((s) => s.percentage)) : 0;
  const lowestScore =
    totalTests > 0 ? Math.min(...submissions.map((s) => s.percentage)) : 0;
  const improvement =
    totalTests > 1
      ? Math.round(
          (submissions[totalTests - 1].percentage - submissions[0].percentage) *
            100
        ) / 100
      : 0;
  const scoreDistribution = {
    excellent: submissions.filter((s) => s.percentage >= 90).length,
    good: submissions.filter((s) => s.percentage >= 80 && s.percentage < 90)
      .length,
    average: submissions.filter((s) => s.percentage >= 70 && s.percentage < 80)
      .length,
    belowAverage: submissions.filter(
      (s) => s.percentage >= 60 && s.percentage < 70
    ).length,
    poor: submissions.filter((s) => s.percentage < 60).length,
  };

  // --- Chart Data ---
  const trendData = {
    labels: submissions.map((s) => s.testName),
    datasets: [
      {
        label: "Score (%)",
        data: submissions.map((s) => s.percentage),
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };
  const doughnutData = {
    labels: [
      "Excellent (90-100%)",
      "Good (80-89%)",
      "Average (70-79%)",
      "Below Average (60-69%)",
      "Poor (<60%)",
    ],
    datasets: [
      {
        data: [
          scoreDistribution.excellent,
          scoreDistribution.good,
          scoreDistribution.average,
          scoreDistribution.belowAverage,
          scoreDistribution.poor,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#374151",
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 640
                ? 10
                : 12,
            weight: "bold",
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6B7280",
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 640
                ? 10
                : 12,
          },
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6B7280",
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 640
                ? 10
                : 12,
          },
        },
      },
    },
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#374151",
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 640 ? 9 : 11,
          },
          padding:
            typeof window !== "undefined" && window.innerWidth < 640 ? 15 : 20,
        },
      },
    },
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return "text-green-600 dark:text-green-400";
    if (percentage >= 80) return "text-blue-600 dark:text-blue-400";
    if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400";
    if (percentage >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadge = (percentage) => {
    if (percentage >= 90)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (percentage >= 80)
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (percentage >= 70)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (percentage >= 60)
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  if (loading) {
    return (
      <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:pt-20 max-sm:p-5 min-h-screen">
        <div className="flex gap-6">
          <StudentSidebar />
          <div className="flex-1">
            <div className="flex items-center justify-center h-40">
              <Loader className="animate-spin text-black dark:text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:pt-20 max-sm:p-5 min-h-screen">
      <div className="flex gap-6">
        <StudentSidebar />

        <div className="flex-1">
          <div className="mb-6">
            <h1 className="font-bold text-3xl mb-2 text-black dark:text-white">
              Completed Tests
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View your test results and performance history
            </p>
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-300">
              <span className="text-lg">{error}</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-300">
              <Award className="w-12 h-12 mb-4 text-gray-400" />
              <span className="text-lg">No completed tests yet.</span>
              <span className="text-sm mt-2">
                Complete a test to see your results here.
              </span>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 flex flex-col items-center">
                  <div className="text-xs sm:text-sm font-medium mb-1">
                    Total Tests
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {totalTests}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 flex flex-col items-center">
                  <div className="text-xs sm:text-sm font-medium mb-1">
                    Average Score
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {averageScore}%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 flex flex-col items-center">
                  <div className="text-xs sm:text-sm font-medium mb-1">
                    Highest Score
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {highestScore}%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4 flex flex-col items-center">
                  <div className="text-xs sm:text-sm font-medium mb-1">
                    Improvement
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-1">
                    {improvement > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-200" />
                    ) : improvement < 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-200 rotate-180" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-gray-200" />
                    )}
                    {Math.abs(improvement)}%
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {/* Performance Trend */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                  <div className="font-semibold mb-2 text-sm sm:text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Performance Trend
                  </div>
                  <div className="h-64 sm:h-80">
                    <Line data={trendData} options={chartOptions} />
                  </div>
                </div>
                {/* Score Distribution */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                  <div className="font-semibold mb-2 text-sm sm:text-base flex items-center gap-2">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    Score Distribution
                  </div>
                  <div className="h-64 sm:h-80">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </div>
                </div>
              </div>

              {/* Test History Table */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 overflow-x-auto">
                <div className="font-semibold mb-2 text-sm sm:text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  Test History
                </div>
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold">
                        Test Name
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold">
                        Score
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold">
                        Date
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          {submission.testName}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <span
                            className={`font-semibold ${getScoreColor(
                              submission.percentage
                            )}`}
                          >
                            {submission.percentage}%
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          {format(
                            new Date(submission.submittedAt),
                            "MMM dd, yyyy 'at' h:mm a"
                          )}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getScoreBadge(
                              submission.percentage
                            )}`}
                          >
                            {submission.percentage >= 90
                              ? "Excellent"
                              : submission.percentage >= 80
                              ? "Good"
                              : submission.percentage >= 70
                              ? "Average"
                              : submission.percentage >= 60
                              ? "Below Average"
                              : "Poor"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
