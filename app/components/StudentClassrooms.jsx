"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import storeUser from "@/lib/store/userStore";
import Image from "next/image";
import Link from "next/link";

const StudentClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentInfo = storeUser((state) => state.studentInfo);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await axios.post(
          "/api/classRoom/getStudentClassrooms",
          {
            studentId: studentInfo.id,
          }
        );
        setClassrooms(response.data.classrooms);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentInfo?.id) {
      fetchClassrooms();
    }
  }, [studentInfo?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (classrooms.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-2xl mx-auto">
        <p className="text-gray-600 text-lg">
          You haven't joined any classrooms yet.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Click the + button to join a classroom using a code.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto">
      {classrooms.map((classroom) => (
        <Link
          href={`/studentDashboard/${classroom.id}`}
          key={classroom.id}
          className="block transform transition-all duration-300 hover:scale-105"
        >
          <div
            className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            style={{
              backgroundImage: `url(${classroom.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "250px",
            }}
          >
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-gray-900 text-2xl font-bold mb-2">
                  {classroom.className}
                </h3>
                <p className="text-gray-800 text-lg">{classroom.subjectName}</p>
                {classroom.sectionName && (
                  <p className="text-gray-700 text-sm mt-1">
                    Section: {classroom.sectionName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Image
                  src={classroom.Teacher.image}
                  alt={classroom.Teacher.fullName}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-gray-200"
                />
                <div>
                  <p className="text-gray-900 font-medium">
                    {classroom.Teacher.fullName}
                  </p>
                  <p className="text-gray-700 text-sm">Teacher</p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default StudentClassrooms;
