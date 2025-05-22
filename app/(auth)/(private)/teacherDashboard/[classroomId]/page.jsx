"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import TeacherHeader from "@/app/components/TeacherHeader";
export default function classRoomPage() {
  const { classroomId } = useParams();
  console.log(classroomId);
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
    <div>
      <TeacherHeader />
      <p>{info.className}</p>
    </div>
  );
}
