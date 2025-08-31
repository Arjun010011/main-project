"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { ShieldBan, Trash } from "lucide-react";
const ClassroomStudents = ({ classroomId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteStudent = async (studentId) => {
    try {
      const response = await axios.put("/api/classRoom/removeStudent", {
        student_id: studentId,
        classroomId,
      });
      if (response.status === 200) {
        console.log("student deleted");
      } else {
        console.log("something went wrong");
      }
    } catch (error) {
      console.log(error);
    }
  };
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
  }, [classroomId, handleDeleteStudent()]);

  const handleBlockStudent = async (studentId) => {
    try {
      const response = await axios.post("/api/classRoom/blockStudent", {
        studentId: studentId,
        classroomId,
      });
      if (response.status === 200) {
        console.log("student deleted");
        handleDeleteStudent(studentId);
      } else {
        console.log("something went wrong");
      }
    } catch (error) {
      console.log(error);
    }
  };
  if (loading) {
    return <div className="text-center p-4">Loading students...</div>;
  }

  if (students.length === 0) {
    return (
      <div className="text-center p-4 dark:bg-gray-600 ">
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
      <div className="grid grid-cols-auto-fit gap-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between gap-4 rounded-lg bg-gray-200 p-4 shadow-md dark:bg-gray-500"
          >
            <div className="flex items-center gap-4">
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
            <div className="flex flex-row items-center justify-center gap-2">
              <div
                className="flex-shrink-0 cursor-pointer rounded-md bg-red-400 p-2 transition-colors duration-200 hover:bg-red-600"
                onClick={() => handleDeleteStudent(student.id)}
              >
                <Trash color="white" size={20} />
              </div>
              {/* <div */}
              {/*   className="flex-shrink-0 cursor-pointer rounded-md bg-gray-300 p-2 transition-colors duration-200 hover:bg-gray-400" */}
              {/*   onClick={() => handleBlockStudent(student.id)} */}
              {/* > */}
              {/*   <ShieldBan color="white" size={20} /> */}
              {/* </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassroomStudents;
