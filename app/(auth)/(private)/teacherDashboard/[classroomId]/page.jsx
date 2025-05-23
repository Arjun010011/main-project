"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useParams } from "next/navigation";
import TeacherHeader from "@/app/components/TeacherHeader";
export default function classRoomPage() {
  const { classroomId } = useParams();
  const [info, setInfo] = useState({});
  useEffect(() => {
    const classRoomInfo = async () => {
      const data = await axios.post("/api/classRoom/getClass", {
        id: classroomId,
      });
      if (data) {
        setInfo(data.data.data);
      }
    };
    classRoomInfo();

    console.log(info);
  }, [info]);
  return (
    <div className="w-full h-full">
      <TeacherHeader />
      <div className="w-[100%] h-[100%] flex items-center justify-center p-5 flex-col gap-5 ">
        <div
          className="bg-cover  h-[20vh] w-[95vw] border-1 border-black shadow-md rounded-xl flex items-center justify-center  flex-col min-md:w-[60vw] "
          style={{ backgroundImage: `url(${info.image})` }}
        >
          <p className="font-bold text-xl uppercase">{info.className}</p>
          <p className="font-semibold text-md italic">{info.subjectName}</p>
        </div>
        <div className="w-full">
          <div className="w-full shadow-md p-5 text-blue flex items-center justify-center border-1 border-blue-300 rounded-md text-blue-500 font-bold text-xl min-md:w-[400px]">
            <span className="font-light text-xl text-black">
              Classroom code :
            </span>
            {info.code}
          </div>
        </div>
      </div>
    </div>
  );
}
