"use client";
import { useEffect, useState } from "react";
import { Loader, Clock, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import StudentSidebar from "./_components/StudentSidebar";

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
        // Fetch classroom details
        const classroomRes = await axios.post(
          "/api/classRoom/getClassStudent",
          {
            id: studentClassroomId,
          },
        );
        setClassroom(classroomRes.data.classRoomInfo);

        // Fetch live tests for this classroom
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
      // Verify test access before allowing the student to join
      const response = await axios.post("/api/classRoom/verifyTestAccess", {
        questionPaperId: testId,
      });

      if (response.data.success) {
        // Access granted - navigate to test interface
        console.log("Access granted for test:", testId);
        router.push(
          `/studentDashboard/${studentClassroomId}/test/${testId}`,
        );
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
    <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:pt-20 max-sm:p-5 min-h-screen">
      <div className="flex gap-6">
        <StudentSidebar />

        <div className="flex-1">
          <div className="mb-6">
            <h1 className="font-bold text-3xl mb-2 text-black dark:text-white">
              Clasroom Name: {classroom?.className || "Classroom"}
            </h1>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>
                Subject:{" "}
                {classroom?.subjectName && `${classroom.subjectName}  `}
              </p>
              <p>
                Section:{" "}
                {classroom?.sectionName && `${classroom.sectionName}  `}
              </p>
              <p>Classroom Code: {classroom?.code}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-bold text-xl mb-4 text-black dark:text-white">
              Tests
            </h2>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader className="animate-spin text-black dark:text-white" />
              </div>
            ) : liveTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-300">
                <span className="text-lg">No tests available.</span>
                <span className="text-sm mt-2">
                  You have either completed all available tests or there are no
                  live tests in this classroom.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {liveTests.map((test) => (
                  <div
                    key={test.id}
                    className="p-5 border-1 border-gray-300 dark:border-gray-700 rounded-lg shadow-lg bg-white dark:bg-gray-900 flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          LIVE NOW
                        </span>
                      </div>

                      <span className="font-bold text-lg text-black dark:text-white">
                        {test.questionPaperName}
                      </span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>Duration: {formatDuration(test.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award size={14} />
                        <span>Total Marks: {test.totalMarks || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>
                          Started:{" "}
                          {test.startedAt
                            ? format(new Date(test.startedAt), "h:mm a")
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full  text-white"
                      onClick={() => handleJoinTest(test.id)}
                    >
                      Join Test
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
