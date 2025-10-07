"use client";
import { useEffect, useState } from "react";
import { Loader, Clock, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import StudentSidebar from "./_components/StudentSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const studentClassroomId = params.studentClassroomId;
  const [liveTests, setLiveTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classroom, setClassroom] = useState(null);

  useEffect(() => {
    const fetchClassroomData = async () => {
      setLoading(true);
      try {
        const classroomRes = await axios.post(
          "/api/classRoom/getClassStudent",
          {
            id: studentClassroomId,
          },
        );
        setClassroom(classroomRes.data.classRoomInfo);

        const liveTestsRes = await axios.post(
          "/api/classRoom/getActiveLiveTests",
          {
            classroomId: studentClassroomId,
          },
        );
        setLiveTests(liveTestsRes.data.liveTests || []);
      } catch (error) {
        console.error("Error fetching classroom data:", error);
        setLiveTests([]);
      } finally {
        setLoading(false);
      }
    };

    if (studentClassroomId) {
      fetchClassroomData();
    }
  }, [studentClassroomId]);

  const handleJoinTest = async (testId) => {
    try {
      const response = await axios.post("/api/classRoom/verifyTestAccess", {
        questionPaperId: testId,
      });

      if (response.data.success) {
        router.push(`/studentDashboard/${studentClassroomId}/test/${testId}`);
      }
    } catch (error) {
      console.error("Error joining test:", error);
      const errorMessage = error.response?.data?.error || "Failed to join test";
      alert(errorMessage);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <StudentSidebar />
      <div className="flex-1 p-8 sm:p-12 lg:ml-[270px] pt-24 max-sm:p-4 max-sm:pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Classroom Header */}
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
              {classroom?.className || "Classroom"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Users size={16} /> {classroom?.studentsCount || 0} Students
              </span>
              <span className="hidden sm:inline">|</span>
              <p>
                Subject:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {classroom?.subjectName || "N/A"}
                </span>
              </p>
              <p>
                Section:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {classroom?.sectionName || "N/A"}
                </span>
              </p>
              <p>
                Code:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {classroom?.code || "N/A"}
                </span>
              </p>
            </div>
          </header>

          {/* Tests Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Live Tests
            </h2>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader className="animate-spin text-blue-500" size={40} />
              </div>
            ) : liveTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-lg shadow-inner text-center">
                <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  No tests available.
                </span>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  There are no live tests in this classroom or you have
                  completed all of them.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveTests.map((test) => (
                  <Card
                    key={test.id}
                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  >
                    <CardHeader className="p-6 pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                          {test.questionPaperName}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        >
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                          LIVE
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="grid gap-3">
                        <div className="flex items-center gap-2">
                          <Clock
                            size={16}
                            className="text-gray-500 dark:text-gray-500"
                          />
                          <span>
                            <span className="font-medium">Duration:</span>{" "}
                            {formatDuration(test.duration)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award
                            size={16}
                            className="text-gray-500 dark:text-gray-500"
                          />
                          <span>
                            <span className="font-medium">Total Marks:</span>{" "}
                            {test.totalMarks || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Started At:</span>
                          <span>
                            {test.startedAt
                              ? format(
                                  new Date(test.startedAt),
                                  "h:mm a, MMM d, yyyy",
                                )
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
                        onClick={() => handleJoinTest(test.id)}
                      >
                        Join Test
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
