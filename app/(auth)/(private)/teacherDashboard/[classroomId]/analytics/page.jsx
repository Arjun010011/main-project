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
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  FileText,
  Target,
  Calendar,
  Award,
  Activity,
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

export default function ClassAnalytics() {
  const { classroomId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [classroomId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/classRoom/getClassAnalytics?classroomId=${classroomId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:p-5 max-sm:pt-[100px] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
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

  if (!analytics) {
    return (
      <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:p-5 max-sm:pt-[100px] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600 mb-4">
              No Analytics Available
            </h1>
            <p className="text-gray-500">
              Complete some tests to see analytics data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Chart data for test performance
  const testPerformanceData = {
    labels: analytics.testPerformance.map((test) => test.testName),
    datasets: [
      {
        label: "Average Score (%)",
        data: analytics.testPerformance.map((test) => test.averageScore),
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Chart data for score distribution
  const scoreDistributionData = {
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
          analytics.scoreDistribution.excellent,
          analytics.scoreDistribution.good,
          analytics.scoreDistribution.average,
          analytics.scoreDistribution.belowAverage,
          analytics.scoreDistribution.poor,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // Green
          "rgba(59, 130, 246, 0.8)", // Blue
          "rgba(245, 158, 11, 0.8)", // Yellow
          "rgba(249, 115, 22, 0.8)", // Orange
          "rgba(239, 68, 68, 0.8)", // Red
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

  // Chart data for participation trend
  const participationData = {
    labels: analytics.testPerformance.map((test) => test.testName),
    datasets: [
      {
        label: "Students Participated",
        data: analytics.testPerformance.map((test) => test.totalStudents),
        backgroundColor: "rgba(147, 51, 234, 0.2)",
        borderColor: "rgba(147, 51, 234, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgba(147, 51, 234, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
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
            size: window.innerWidth < 640 ? 10 : 12,
            weight: "bold",
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: window.innerWidth < 640 ? 10 : 12,
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
            size: window.innerWidth < 640 ? 10 : 12,
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
            size: window.innerWidth < 640 ? 9 : 11,
          },
          padding: window.innerWidth < 640 ? 15 : 20,
        },
      },
    },
  };

  return (
    <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:p-5 max-sm:pt-[100px] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Class Analytics Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Comprehensive overview of your classroom performance and student
            engagement
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Total Tests
              </CardTitle>
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {analytics.totalTests}
              </div>
              <p className="text-xs text-blue-100">Completed tests</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {analytics.totalStudents}
              </div>
              <p className="text-xs text-green-100">Enrolled students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Average Score
              </CardTitle>
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {analytics.averageScore}%
              </div>
              <p className="text-xs text-purple-100">Class average</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Participation Rate
              </CardTitle>
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {analytics.participationRate}%
              </div>
              <p className="text-xs text-orange-100">Student engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Test Performance Chart */}
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Test Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="h-64 sm:h-80">
                <Bar data={testPerformanceData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Score Distribution Chart */}
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
                  data={scoreDistributionData}
                  options={doughnutOptions}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participation Trend */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              Participation Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="h-64 sm:h-80">
              <Line data={participationData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Test Details Table */}
        {analytics.testPerformance.length > 0 && (
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base">
                Test Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold">
                        Test Name
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold">
                        Students
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold">
                        Average Score
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold">
                        Total Marks
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.testPerformance.map((test, index) => (
                      <tr
                        key={test.testId}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          {test.testName}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <Badge variant="secondary">
                            {test.totalStudents}
                          </Badge>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <span
                            className={`font-semibold ${
                              test.averageScore >= 90
                                ? "text-green-600"
                                : test.averageScore >= 80
                                  ? "text-blue-600"
                                  : test.averageScore >= 70
                                    ? "text-yellow-600"
                                    : test.averageScore >= 60
                                      ? "text-orange-600"
                                      : "text-red-600"
                            }`}
                          >
                            {test.averageScore}%
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          {test.totalMarks}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <Badge className="bg-green-100 text-green-800">
                            Completed
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
    </div>
  );
}
