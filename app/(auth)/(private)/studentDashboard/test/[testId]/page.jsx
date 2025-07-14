"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId;
  const [testInfo, setTestInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAndLoadTest = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verify test access
        const response = await axios.post("/api/classRoom/verifyTestAccess", {
          questionPaperId: testId,
        });

        if (response.data.success) {
          setTestInfo(response.data.testInfo);
        }
      } catch (error) {
        console.error("Error accessing test:", error);
        const errorMessage =
          error.response?.data?.error || "Failed to access test";
        setError(errorMessage);

        // Redirect to student dashboard after showing error
        setTimeout(() => {
          router.push("/studentDashboard");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      verifyAndLoadTest();
    }
  }, [testId, router]);

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
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!testInfo) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Test Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The test you're looking for doesn't exist or is no longer available.
          </p>
          <Button onClick={() => router.push("/studentDashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {testInfo.name}
            </h1>

            <div className="flex justify-center items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Duration: {testInfo.duration || "N/A"} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Total Marks: {testInfo.totalMarks || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test Instructions
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Read each question carefully before answering</li>
              <li>• You can only select one answer per question</li>
              <li>• Once you submit an answer, you cannot change it</li>
              <li>• The test will automatically submit when time runs out</li>
              <li>• Do not refresh the page during the test</li>
            </ul>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              className="px-8 py-3 text-lg"
              onClick={() => {
                router.push(`/studentDashboard/test/${testId}/testInterface`);
              }}
            >
              Start Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
