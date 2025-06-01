"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

const ClassroomStudents = ({ classroomId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.post(
          "/api/classRoom/getClassroomStudents",
          {
            classroomId,
          },
        );
        setStudents(response.data.students);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    if (classroomId) {
      fetchStudents();
    }
  }, [classroomId]);

  if (loading) {
    return <div className="text-center p-4">Loading students...</div>;
  }

  if (students.length === 0) {
    return (
      <div className="text-center p-4 dark:text-gray-800">
        <p className="text-gray-600 dark:text-gray-200">
          No students have joined this classroom yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 dark:bg-gray-900">
      <h2 className="text-xl font-bold mb-4 dark:text-white">
        Students ({students.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 dark:bg-gray-500"
          >
            <Image
              src={student.image}
              alt={student.fullName}
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <h3 className="font-semibold dark:text-white">
                {student.fullName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-200">
                {student.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                Joined: {new Date(student.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassroomStudents;
