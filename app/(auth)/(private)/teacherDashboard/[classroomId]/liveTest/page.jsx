"use client";
import { useEffect, useState } from "react";
import { Loader, Clock, FileText, Calendar, Zap } from "lucide-react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import axios from "axios";
import LiveTestDropdown from "@/app/components/LiveTestDropdown";

export default function LiveTestPage() {
  const params = useParams();
  const classroomId = params.classroomId;
  const [liveTests, setLiveTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [goingLive, setGoingLive] = useState(null);
  const [endingTest, setEndingTest] = useState(null);

  useEffect(() => {
    const fetchLiveTests = async () => {
      setLoading(true);
      try {
        const res = await axios.post("/api/classRoom/fetchLiveTests", {
          classroomId,
        });
        setLiveTests(res.data.liveTests || []);
      } catch (error) {
        setLiveTests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveTests();
  }, [classroomId]);

  const handleDelete = (testId) => {
    console.log("Delete test:", testId);
  };

  const handleGoLive = async (testId) => {
    try {
      setGoingLive(testId);
      const res = await axios.post("/api/classRoom/goLive", {
        questionPaperId: testId,
      });
      if (res.data.success) {
        setLiveTests((prevTests) =>
          prevTests.map((test) =>
            test.id === testId
              ? { ...test, status: "live", isLiveTest: true }
              : test,
          ),
        );
        alert("Test is now live! Students can now access it.");
      }
    } catch (error) {
      console.error("Error going live:", error);
      alert("Failed to start live test. Please try again.");
    } finally {
      setGoingLive(null);
    }
  };

  const handleEndTest = async (testId) => {
    try {
      setEndingTest(testId);
      const res = await axios.post("/api/classRoom/endLiveTest", {
        questionPaperId: testId,
      });
      if (res.data.success) {
        setLiveTests((prevTests) =>
          prevTests.map((test) =>
            test.id === testId
              ? { ...test, status: "completed", isLiveTest: false }
              : test,
          ),
        );
        alert("Test has been ended! Students can no longer access it.");
      }
    } catch (error) {
      console.error("Error ending test:", error);
      alert("Failed to end live test. Please try again.");
    } finally {
      setEndingTest(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "live":
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            LIVE NOW
          </div>
        );
      case "scheduled":
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
            <Clock size={12} />
            SCHEDULED
          </div>
        );
      case "completed":
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium">
            <FileText size={12} />
            COMPLETED
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
            <Calendar size={12} />
            DRAFT
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Live Tests
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Manage and monitor your live test question papers
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : liveTests.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No Live Tests Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Move a question paper to live test to see it here and start
                engaging with your students.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveTests.map((test, index) => {
              const isLive = test.status === "live";
              const isLoading = goingLive === test.id || endingTest === test.id;

              return (
                <div
                  key={test.id}
                  className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">
                          {test.questionPaperName}
                        </h3>
                        {getStatusBadge(test.status)}
                      </div>
                      <div
                        className={`ml-4 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        <LiveTestDropdown
                          onDelete={() => handleEndTest(test.id)}
                          onGoLive={() => handleGoLive(test.id)}
                          onEndTest={() => handleEndTest(test.id)}
                          isLoading={isLoading}
                          isLive={isLive}
                        />
                      </div>
                    </div>

                    {/* Date and Time Info */}
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {format(new Date(test.createdAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>
                          {format(new Date(test.createdAt), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Loading Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Loader size={16} className="animate-spin" />
                        <span className="text-sm font-medium">
                          {goingLive === test.id
                            ? "Going Live..."
                            : "Ending Test..."}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Live Indicator */}
                  {isLive && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
