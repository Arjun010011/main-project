"use client";
import { useEffect, useState } from "react";
import { Loader, Clock, Award, Users, Sparkles, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import StudentSidebar from "./_components/StudentSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import storeUser from "@/lib/store/userStore";

export default function StudentClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const studentClassroomId = params.studentClassroomId;
  const [liveTests, setLiveTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classroom, setClassroom] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [streamingPlan, setStreamingPlan] = useState("");

  // Get study plan methods from Zustand store
  const studyPlan = storeUser((state) => state.getStudyPlan(studentClassroomId));
  const setStudyPlan = storeUser((state) => state.setStudyPlan);

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

  const fetchRecommendations = async () => {
    if (!studentClassroomId) return;
    setRecLoading(true);
    try {
      const res = await axios.get("/api/classRoom/recommendPractice", {
        params: { classroomId: studentClassroomId, limit: 15 },
      });
      setRecommendations(res.data?.questions || []);
    } catch (e) {
      console.error("Failed to fetch recommendations", e);
      setRecommendations([]);
      alert("Could not fetch recommendations. Try again later.");
    } finally {
      setRecLoading(false);
    }
  };

  const generateStudyPlan = async () => {
    if (!studentClassroomId) return;
    setPlanLoading(true);
    setStreamingPlan(""); // Clear streaming content
    
    try {
      // Try streaming approach first
      const response = await fetch(
        `/api/classRoom/generateStudyPlan?classroomId=${studentClassroomId}&days=14`
      );

      if (!response.ok) {
        throw new Error("Failed to generate study plan");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedPlan = "";

      if (reader) {
        // Stream the response
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedPlan += chunk;
          
          // Clean and display in real-time
          let displayText = accumulatedPlan.trim();
          displayText = displayText.replace(/^```html\s*/i, "");
          displayText = displayText.replace(/```\s*$/, "");
          
          setStreamingPlan(displayText);
        }

        // Final cleanup
        let cleanedPlan = accumulatedPlan.trim();
        cleanedPlan = cleanedPlan.replace(/^```html\s*/i, "");
        cleanedPlan = cleanedPlan.replace(/```\s*$/, "");
        cleanedPlan = cleanedPlan.trim();

        // Save final cleaned plan to Zustand
        setStudyPlan(studentClassroomId, cleanedPlan);
      } else {
        // Fallback to regular axios if streaming not supported
        const res = await axios.get("/api/classRoom/generateStudyPlan", {
          params: { classroomId: studentClassroomId, days: 14 },
        });
        let newPlanHtml = res.data?.planHtml || "";
        newPlanHtml = newPlanHtml.replace(/^```html\s*/i, "").replace(/```\s*$/, "").trim();
        setStudyPlan(studentClassroomId, newPlanHtml);
      }
    } catch (e) {
      console.error("Failed to generate study plan", e);
      alert("Could not generate study plan. Try again later.");
    } finally {
      setPlanLoading(false);
      setStreamingPlan("");
    }
  };

  // Display streaming plan while loading, otherwise show saved plan
  const displayPlan = planLoading && streamingPlan ? streamingPlan : studyPlan;

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

          {/* AI Study Plan */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
                AI Study Plan
              </h2>
              <Button
                onClick={generateStudyPlan}
                disabled={planLoading}
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
              >
                {planLoading ? (
                  <span className="flex items-center gap-2"><Loader className="animate-spin" size={16} /> Generating...</span>
                ) : (
                  "Generate Study Plan"
                )}
              </Button>
            </div>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950 border-purple-200 dark:border-purple-800 rounded-xl shadow-lg overflow-hidden">
              <CardContent className="p-0">
                {planLoading && !streamingPlan ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4 p-6">
                    <div className="relative">
                      <Loader className="animate-spin text-purple-500" size={48} />
                      <div className="absolute inset-0 animate-ping">
                        <Sparkles className="text-purple-300" size={48} />
                      </div>
                    </div>
                    <p className="text-base font-medium text-purple-700 dark:text-purple-300 text-center">
                      Analyzing your performance...
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
                      Creating a personalized 14-day study plan based on your strengths and areas for improvement
                    </p>
                  </div>
                ) : displayPlan ? (
                  <div className="relative">
                    {/* Decorative header gradient */}
                    <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
                    
                    {/* Content area with beautiful styling */}
                    <div className="p-8 max-sm:p-6">
                      <div 
                        className="
                          prose prose-purple dark:prose-invert max-w-none
                          prose-headings:text-purple-700 dark:prose-headings:text-purple-400
                          prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-4 prose-h3:mt-6 prose-h3:flex prose-h3:items-center prose-h3:gap-2
                          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                          prose-ul:space-y-3 prose-ul:my-4
                          prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed
                          prose-strong:text-purple-600 dark:prose-strong:text-purple-400 prose-strong:font-semibold
                        "
                        dangerouslySetInnerHTML={{ __html: displayPlan }} 
                      />
                      
                      {/* Streaming indicator */}
                      {planLoading && streamingPlan && (
                        <div className="flex items-center gap-2 mt-6 text-sm text-purple-600 dark:text-purple-400">
                          <Loader className="animate-spin" size={16} />
                          <span className="animate-pulse">Generating more content...</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Success indicator when done */}
                    {!planLoading && displayPlan && (
                      <div className="px-8 pb-6 pt-2 border-t border-purple-100 dark:border-purple-900">
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Plan generated successfully and saved!</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 gap-6">
                    <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Sparkles className="text-purple-600 dark:text-purple-400" size={40} />
                    </div>
                    <div className="text-center">
                      <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Ready to Create Your Study Plan?
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md">
                        Get a personalized 14-day study plan tailored to your performance, focusing on your weak areas and building on your strengths.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Adaptive Practice Recommendations */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ListChecks size={20} className="text-blue-600 dark:text-blue-400" />
                Adaptive Practice
              </h2>
              <Button
                onClick={fetchRecommendations}
                disabled={recLoading}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {recLoading ? (
                  <span className="flex items-center gap-2"><Loader className="animate-spin" size={16} /> Loading...</span>
                ) : (
                  "Get Recommendations"
                )}
              </Button>
            </div>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl shadow-lg">
              <CardContent className="p-0">
                {recLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader className="animate-spin text-blue-500" size={40} />
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-400">No recommendations yet. Click "Get Recommendations" to fetch questions targeting your weak areas.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-950">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chapter</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Difficulty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Question</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {recommendations.map((q) => (
                          <tr key={String(q.id)}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{q.Subject || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{q.Chapter || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{q.Difficulty || "-"}</Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{q.Question || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}