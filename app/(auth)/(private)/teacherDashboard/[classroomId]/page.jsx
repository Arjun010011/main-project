"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import TeacherHeader from "@/app/components/TeacherHeader";
import ClassroomStudents from "@/app/components/ClassroomStudents";

export default function ClassRoomPage() {
  const { classroomId } = useParams();
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const classRoomInfo = async () => {
      try {
        const data = await axios.post("/api/classRoom/getClass", {
          id: classroomId,
        });
        if (data) {
          setInfo(data.data.data);
        }
      } catch (error) {
        console.error("Error fetching classroom info:", error);
      } finally {
        setLoading(false);
      }
    };
    classRoomInfo();
  }, [classroomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 ">
        <TeacherHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <TeacherHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Classroom Banner */}
          <div
            className="relative h-[300px] rounded-2xl overflow-hidden shadow-xl"
            style={{
              backgroundImage: `url(${info.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 p-8 flex items-end">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {info.className}
                </h1>
                <p className="text-xl text-gray-800">{info.subjectName}</p>
                {info.sectionName && (
                  <p className="text-lg text-gray-700 mt-1">
                    Section: {info.sectionName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Classroom Code */}
          <div className="bg-white rounded-xl shadow-md p-6 dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-200">
                    Classroom Code
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {info.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(info.code);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Copy Code
              </button>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden dark:text-gray-800">
            <ClassroomStudents classroomId={classroomId} />
          </div>
        </div>
      </div>
    </div>
  );
}
