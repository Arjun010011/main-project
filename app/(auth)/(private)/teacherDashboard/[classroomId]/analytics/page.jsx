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
    <div className="pt-[100px] min-lg:pl-[270px] px-5 dark:bg-gray-900 bg-gray-50 max-sm:p-5 max-sm:pt-[100px] min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            Class Analytics Dashboard
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Visual overview of your class performance and engagement
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              title: "Total Tests",
              value: analytics.totalTests,
              icon: <FileText className="h-5 w-5" />,
              gradient: "from-blue-500/90 to-blue-600/90",
              subtitle: "Completed tests",
            },
            {
              title: "Total Students",
              value: analytics.totalStudents,
              icon: <Users className="h-5 w-5" />,
              gradient: "from-green-500/90 to-green-600/90",
              subtitle: "Enrolled students",
            },
            {
              title: "Average Score",
              value: `${analytics.averageScore}%`,
              icon: <Target className="h-5 w-5" />,
              gradient: "from-purple-500/90 to-purple-600/90",
              subtitle: "Class average",
            },
            {
              title: "Participation Rate",
              value: `${analytics.participationRate}%`,
              icon: <Activity className="h-5 w-5" />,
              gradient: "from-orange-500/90 to-orange-600/90",
              subtitle: "Student engagement",
            },
          ].map((card, i) => (
            <Card
              key={i}
              className={`bg-gradient-to-br ${card.gradient} text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 backdrop-blur-sm`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5">
                <CardTitle className="text-sm font-semibold">
                  {card.title}
                </CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent className="px-5">
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-sm opacity-90">{card.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md dark:shadow-gray-800/50 hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-100">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Test Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar data={testPerformanceData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md dark:shadow-gray-800/50 hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-100">
                <Award className="h-5 w-5 text-green-500" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Doughnut
                  data={scoreDistributionData}
                  options={doughnutOptions}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participation Trend */}
        <Card className="shadow-md dark:shadow-gray-800/50 hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-100">
              <Calendar className="h-5 w-5 text-purple-500" />
              Participation Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={participationData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Test Details Table */}
        {analytics.testPerformance.length > 0 && (
          <Card className="shadow-md dark:shadow-gray-800/50 border border-gray-100 dark:border-gray-700 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">
                Test Details
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300">
                    {["Test Name", "Students", "Average Score", "Status"].map(
                      (head) => (
                        <th
                          key={head}
                          className="text-left py-3 px-4 font-semibold"
                        >
                          {head}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {analytics.testPerformance.map((test) => (
                    <tr
                      key={test.testId}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{test.testName}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{test.totalStudents}</Badge>
                      </td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300">
                          Completed
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
