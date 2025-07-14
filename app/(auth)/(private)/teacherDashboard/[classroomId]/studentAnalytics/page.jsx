"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  User,
  Target,
  Award,
  Calendar,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
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

export default function StudentAnalytics() {
  const { classroomId } = useParams();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudentAnalytics();
  }, [classroomId]);

  const fetchStudentAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/classRoom/getStudentAnalytics?classroomId=${classroomId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student analytics");
      }

      const data = await response.json();
      setStudents(data.students);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  if (loading) {
    return (
      <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:p-5 max-sm:pt-[100px] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:p-5 max-sm:pt-[100px] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:p-5 max-sm:pt-[100px] min-h-screen">
      <div className="max-w-7xl mx-auto mt-20">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Student Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Individual student performance and progress tracking
          </p>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {filteredStudents.map((student) => (
            <Card
              key={student.studentId}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedStudent?.studentId === student.studentId
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : ""
              }`}
              onClick={() => setSelectedStudent(student)}
            >
              <CardHeader className="pb-3 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {student.studentName}
                  </CardTitle>
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {student.studentEmail}
                </p>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Tests Taken:
                    </span>
                    <Badge variant="secondary">{student.totalTests}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Average Score:
                    </span>
                    <span
                      className={`font-semibold text-sm sm:text-base ${getScoreColor(
                        student.averageScore,
                      )}`}
                    >
                      {student.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Improvement:
                    </span>
                    <div className="flex items-center gap-1">
                      {getImprovementIcon(student.improvement)}
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          student.improvement > 0
                            ? "text-green-600"
                            : student.improvement < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {Math.abs(student.improvement)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Student Details */}
        {selectedStudent && (
          <div className="space-y-6">
            {/* Student Header */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                  {selectedStudent.studentName} - Performance Overview
                </CardTitle>
                <p className="text-blue-100 text-sm sm:text-base">
                  {selectedStudent.studentEmail}
                </p>
              </CardHeader>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Average Score
                  </CardTitle>
                  <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {selectedStudent.averageScore}%
                  </div>
                  <p className="text-xs text-green-100">Overall performance</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Highest Score
                  </CardTitle>
                  <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {selectedStudent.highestScore}%
                  </div>
                  <p className="text-xs text-blue-100">Best performance</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Tests Taken
                  </CardTitle>
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {selectedStudent.totalTests}
                  </div>
                  <p className="text-xs text-purple-100">Total participation</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Improvement
                  </CardTitle>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-1">
                    {getImprovementIcon(selectedStudent.improvement)}
                    {Math.abs(selectedStudent.improvement)}%
                  </div>
                  <p className="text-xs text-orange-100">Progress over time</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Performance Trend */}
              {selectedStudent.performanceTrend.length > 0 && (
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
                          labels: selectedStudent.performanceTrend.map(
                            (test) => test.testName,
                          ),
                          datasets: [
                            {
                              label: "Score (%)",
                              data: selectedStudent.performanceTrend.map(
                                (test) => test.score,
                              ),
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
                          plugins: {
                            legend: {
                              position: "top",
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                            },
                          },
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
                              selectedStudent.scoreDistribution.excellent,
                              selectedStudent.scoreDistribution.good,
                              selectedStudent.scoreDistribution.average,
                              selectedStudent.scoreDistribution.belowAverage,
                              selectedStudent.scoreDistribution.poor,
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
                        plugins: {
                          legend: {
                            position: "bottom",
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test History Table */}
            {selectedStudent.performanceTrend.length > 0 && (
              <Card>
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    Test History
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">
                            Test Name
                          </th>
                          <th className="text-left py-3 px-4 font-semibold">
                            Score
                          </th>
                          <th className="text-left py-3 px-4 font-semibold">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 font-semibold">
                            Performance
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.performanceTrend.map((test, index) => (
                          <tr
                            key={test.testId}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">{test.testName}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-semibold ${getScoreColor(
                                  test.score,
                                )}`}
                              >
                                {test.score}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {new Date(test.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  test.score >= 90
                                    ? "bg-green-100 text-green-800"
                                    : test.score >= 80
                                      ? "bg-blue-100 text-blue-800"
                                      : test.score >= 70
                                        ? "bg-yellow-100 text-yellow-800"
                                        : test.score >= 60
                                          ? "bg-orange-100 text-orange-800"
                                          : "bg-red-100 text-red-800"
                                }
                              >
                                {test.score >= 90
                                  ? "Excellent"
                                  : test.score >= 80
                                    ? "Good"
                                    : test.score >= 70
                                      ? "Average"
                                      : test.score >= 60
                                        ? "Below Average"
                                        : "Poor"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No students found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your search terms."
                : "No students have taken tests yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
