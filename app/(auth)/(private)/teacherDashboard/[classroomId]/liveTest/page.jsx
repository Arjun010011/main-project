"use client";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import axios from "axios";

export default function LiveTestPage() {
  const params = useParams();
  const classroomId = params.classroomId;
  const [liveTests, setLiveTests] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:p-5 min-h-screen">
      <h1 className="font-bold text-3xl mb-2 text-black dark:text-white">
        Live Tests
      </h1>
      <p className="mb-6 font-medium italic text-sm text-gray-600 dark:text-gray-300">
        Manage and monitor your live test question papers here.
      </p>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="animate-spin text-black dark:text-white" />
        </div>
      ) : liveTests.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-gray-500 dark:text-gray-300">
          <span className="text-lg">No live tests available.</span>
          <span className="text-sm mt-2">
            Move a question paper to live test to see it here.
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5">
          {liveTests.map((test) => (
            <div
              key={test.id}
              className="p-5 max-w-[370px] w-full border-1 border-gray-300 dark:border-gray-700 rounded-lg shadow-lg bg-white dark:bg-gray-900 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <span className="font-bold text-lg text-black dark:text-white">
                  {test.questionPaperName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Created:{" "}
                  {format(new Date(test.createdAt), "do MMMM yyyy, h:mm a")}
                </span>
              </div>
              <Button variant="secondary" className="w-full">
                View Test
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
