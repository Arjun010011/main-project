"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import TeacherHeader from "@/app/components/TeacherHeader";
import ClassroomStudents from "@/app/components/ClassroomStudents";
import { Loader } from "lucide-react";
export default function ClassRoomPage() {
  const [buttonColor, setButtonColor] = useState("#1E90FF");
  const { classroomId } = useParams();
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const classRoomInfo = async () => {
      try {
        const data = await axios.post("/api/classRoom/getClassTeacher", {
          id: classroomId,
        });
        if (data) {
          setInfo(data.data.classRoomInfo);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 ">
        <TeacherHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Loader className="animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 ">
      <div className="flex w-full h-full items-center pt-[100px]">
        <div className="w-full h-[95vh] min-lg:ml-[15vw]  flex   flex-col items-center px-5">
          {/* Classroom Banner */}
          <div className=" w-full min-w-[200px]  max-w-[900px] min-md:h-[200px] rounded-2xl overflow-hidden shadow-xl bg-blue-100 border-1 border-blue-300 h-[100px] max-sm:flex max-sm:items-center max-sm:w-full    ">
            <div className="  p-8 min-md:flex items-center justify-between">
              <div className="hidden min-md:block">
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
              <div className="text-gray-800  max-sm:flex max-sm:items-center max-sm:justify-center max-sm:gap-25 ">
                <p>Classroom code</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(info.code);
                    setButtonColor("gray");
                  }}
                  className="cursor-pointer"
                >
                  <p
                    className=" px-8 py-3  rounded-xl font-bold  text-white min-md:mt-3"
                    style={{ backgroundColor: buttonColor }}
                  >
                    {info.code}
                  </p>
                </button>
              </div>
            </div>
          </div>
          {/* Students List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden dark:text-gray-800 mt-5 max-w-[900px]  w-full">
            <ClassroomStudents classroomId={classroomId} />
          </div>
        </div>
      </div>
    </div>
  );
}
