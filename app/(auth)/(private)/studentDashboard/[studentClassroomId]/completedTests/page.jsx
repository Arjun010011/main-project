"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import storeUser from "@/lib/store/userStore";
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
import { Doughnut, Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  TrendingUp,
  Target,
  Award,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Brain,
} from "lucide-react";

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
  Filler,
);

export default function StudentAnalyticsPage() {
  const { studentClassroomId } = useParams();
  const studentInfo = storeUser((state) => state.studentInfo); // get logged-in student
  const studentId = studentInfo?.id;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId || !studentClassroomId) return;

    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/classRoom/getStudentAnalytics?classroomId=${studentClassroomId}&studentId=${studentId}`,
        );
        if (!res.ok) throw new Error("Failed to fetch student analytics");

        const data = await res.json();
        setStudent(data.students[0] || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentClassroomId, studentId]);
  const getImprovementIcon = (improvement) => {
    if (improvement > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (improvement < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) return <div className="pt-32 text-center">Loading...</div>;
  if (error)
    return <div className="pt-32 text-center text-red-600">{error}</div>;
  if (!student)
    return <div className="pt-32 text-center">No analytics found</div>;

  return (
    <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:p-5 max-sm:pt-[100px] min-h-screen">
      <div className="max-w-7xl mx-auto mt-20 space-y-6">
        {/* Student Header */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
              {student.studentName} - Performance Overview
            </CardTitle>
            <p className="text-blue-100 text-sm sm:text-base">
              {student.studentEmail}
            </p>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex justify-between pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Average Score
              </CardTitle>
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {student.averageScore}%
              </div>
              <p className="text-xs text-green-100">Overall performance</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex justify-between pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Highest Score
              </CardTitle>
              <Award className="h-3 w-3 sm:h-4 sm:w-4" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {student.highestScore}%
              </div>
              <p className="text-xs text-blue-100">Best performance</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex justify-between pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Tests Taken
              </CardTitle>
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {student.totalTests}
              </div>
              <p className="text-xs text-purple-100">Total participation</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex justify-between pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Improvement
              </CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-1">
                {getImprovementIcon(student.improvement)}
                {Math.abs(student.improvement)}%
              </div>
              <p className="text-xs text-orange-100">Progress over time</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & AI Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Performance Trend */}
          {student.performanceTrend.length > 0 && (
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="h-64 sm:h-80">
                  <Line
                    data={{
                      labels: student.performanceTrend.map((t) => t.testName),
                      datasets: [
                        {
                          label: "Score (%)",
                          data: student.performanceTrend.map((t) => t.score),
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
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "top" } },
                      scales: { y: { beginAtZero: true, max: 100 } },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score Distribution */}
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="h-64 sm:h-80">
                <Doughnut
                  data={{
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
                          student.scoreDistribution.excellent,
                          student.scoreDistribution.good,
                          student.scoreDistribution.average,
                          student.scoreDistribution.belowAverage,
                          student.scoreDistribution.poor,
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
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestions Section */}
        {student.detailedSubmissionAnalytics?.length > 0 && (
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                AI Insights & Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-4">
                {student.detailedSubmissionAnalytics.map(
                  (item) =>
                    item.aiSuggestion && (
                      <div
                        key={item.submissionId}
                        className="border-b pb-3 last:border-b-0 last:pb-0"
                      >
                        <h4 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 mb-1">
                          Test: {item.questionPaperName}
                        </h4>
                        <div
                          className="text-gray-700 dark:text-gray-300 text-sm"
                          dangerouslySetInnerHTML={{
                            __html: item.aiSuggestion,
                          }}
                        />
                      </div>
                    ),
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
