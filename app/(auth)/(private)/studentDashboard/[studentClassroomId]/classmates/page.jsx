"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StudentSidebar from "../_components/StudentSidebar";
import { Users, Loader } from "lucide-react";
import axios from "axios";

export default function ClassmatesPage() {
  const { studentClassroomId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassmates = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "/api/classRoom/getClassroomStudents",
          {
            classroomId: studentClassroomId,
          }
        );
        setStudents(response.data.students || []);
      } catch (err) {
        setError("Failed to load classmates");
      } finally {
        setLoading(false);
      }
    };
    if (studentClassroomId) fetchClassmates();
  }, [studentClassroomId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:pt-20 max-sm:p-5 min-h-screen">
      <div className="flex gap-6">
        <StudentSidebar />
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="font-bold text-3xl mb-2 text-black dark:text-white flex items-center gap-2">
              <Users className="h-7 w-7 text-blue-600" /> Classmates
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              All students enrolled in this classroom
            </p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader className="animate-spin text-black dark:text-white" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-300">
              <span className="text-lg">{error}</span>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-300">
              <Users className="w-12 h-12 mb-4 text-gray-400" />
              <span className="text-lg">No classmates found.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4"
                >
                  {/* Remove avatar image */}
                  <div className="mt-2 text-center">
                    <div className="font-semibold text-lg">{student.name}</div>
                    <div className="text-sm text-zinc-500 break-all">
                      {student.email}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      Joined: {formatDate(student.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
