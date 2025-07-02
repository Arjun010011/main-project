"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
function page() {
  const params = useParams();
  const classroomId = params.classroomId;
  const [content, setContent] = useState(null);
  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const data = await axios.post("/api/classRoom/fetchQuestionPapers", {
          classroomId,
        });
        setContent(data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPaper();
  }, []);
  if (!content)
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  return (
    <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:p-5 max-sm:pt-[100px] h-screen">
      <p className="font-bold text-3xl">Question Papers</p>
      <p className="mt-3 font-medium italic text-sm ">
        Manage your genrated question paper here
      </p>
      <p>total papers: {content?.totalPaper}</p>
      <div className="w-auto h-auto p-5  border-1 border-gray-200 overflow-x-hidden mt-5 rounded-md"></div>
    </div>
  );
}

export default page;
