"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
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
  console.log(content);
  return (
    <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:p-5 max-sm:pt-[100px] min-h-screen">
      <p className="font-bold text-3xl">Question Papers</p>
      <p className="mt-3 font-medium italic text-sm ">
        Manage your genrated question paper here
      </p>
      <p>total papers: {content?.totalPaper}</p>
      <div className="w-auto h-auto p-5  border-1 border-gray-200 overflow-x-hidden mt-5 rounded-md max-sm:p-2 ">
        <div className="flex flex-wrap p-2 w-full h-full gap-5 max-sm:flex-col ">
          {content.questionPaperDetails.map((questionPaper) => {
            const date = format(questionPaper.createdAt, "do MMMM yyyy,h:mm a");
            return (
              <div
                className="p-5 w-full h-full max-h-[450px] max-w-[370px] border-1 border-gray-300 flex flex-col gap-6 rounded-lg   "
                key={questionPaper.id}
              >
                <p>{date}</p>
                <p>{questionPaper.questionPaperName}</p>
                <Button className="w-full cursor-pointer">Download</Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default page;
