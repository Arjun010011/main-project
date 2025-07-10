"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import DropDownTeacherMenu from "@/app/components/DropDownTeacherMenu";
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
  //function to create the download paper
  function generateKCETPaper(questions) {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 25;

    //  Header
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("KCET 2025 Question Paper", pageWidth / 2, 15, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.text("PHYSICS  (Code: A1)", pageWidth / 2, 22, { align: "center" });

    // ===== Questions =====
    questions.forEach((item, index) => {
      const q = item.question;

      doc.setFontSize(11);
      doc.setFont("times", "normal");
      doc.setTextColor(0);

      // Question number & text
      const questionText = `${index + 1}. ${q.Question}`;
      const questionLines = doc.splitTextToSize(questionText, pageWidth - 20);
      doc.text(questionLines, 12, y);

      y += questionLines.length * 6;

      const options = [
        { label: "(A)", text: q.Option_A },
        { label: "(B)", text: q.Option_B },
        { label: "(C)", text: q.Option_C },
        { label: "(D)", text: q.Option_D },
      ];

      options.forEach((opt) => {
        const optLines = doc.splitTextToSize(
          `${opt.label} ${opt.text}`,
          pageWidth - 25,
        );
        doc.text(optLines, 20, y);
        y += optLines.length * 6;
      });

      y += 6;

      if (y > pageHeight - 30) {
        addFooter(doc, pageWidth, pageHeight);
        doc.addPage();
        y = 25;
      }
    });

    // Final footer
    addFooter(doc, pageWidth, pageHeight);

    doc.save("KCET_Question_Paper.pdf");
  }

  function addFooter(doc, pageWidth, pageHeight) {
    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.text("Space For Rough Work", pageWidth / 2, pageHeight - 20, {
      align: "center",
    });

    doc.setFontSize(9);
    doc.setFont("times", "normal");
    doc.text("A-1", 10, pageHeight - 10);
    doc.text(
      `${doc.internal.getNumberOfPages()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );
    doc.text("1B0616K22", pageWidth - 10, pageHeight - 10, { align: "right" });
  }
  //function to fetch questions and call generate paper function
  const questionPaperDownload = async (paperId) => {
    try {
      const paperInfo = await axios.post("/api/classRoom/fetchQuestionPaper", {
        questionPaperId: paperId,
      });

      const paperData = await paperInfo.data.questionPaper.questions;
      generateKCETPaper(paperData);
    } catch (error) {
      console.log(error);
    }
  };
  if (!content)
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loader className="animate-spin" />
      </div>
    );

  //delete paper
  const deletePaper = async (id) => {
    try {
      const delPaper = await axios.delete(
        "/api/classroom/deleteQuestionPaper",
        {
          data: { paperId: id },
        },
      );
      if (delPaper.status === 200) {
        console.log("paperDeleted");
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="pt-[100px] min-lg:pl-[270px] pr-5 dark:bg-gray-800 max-sm:p-5 max-sm:pt-[100px] min-h-screen">
      <p className="font-bold text-3xl">Question Papers</p>
      <p className="mt-3 font-medium italic text-sm ">
        Manage your genrated question paper here
      </p>
      <p className="pt-5 font-bold text-lg">
        total papers: {content?.totalPaper ?? "..."}
      </p>
      <div className="w-auto h-auto p-5  border-1 border-gray-200 overflow-x-hidden mt-3 rounded-md max-sm:p-2 ">
        <div className="flex flex-wrap p-2 w-full h-full gap-5 max-sm:flex-col ">
          {content.questionPaperDetails
            .slice()
            .reverse()
            .map((questionPaper) => {
              const date = format(
                questionPaper.createdAt,
                "do MMMM yyyy,h:mm a",
              );
              return (
                <div
                  className="p-5 w-full h-full max-h-[450px] max-w-[370px] border-1 border-gray-300 flex flex-col gap-6 rounded-lg  shadow-lg "
                  key={questionPaper.id}
                >
                  <div className="flex justify-between ">
                    <div className="flex flex-col gap-2">
                      <p>
                        <span className="italic font-bold pr-1">
                          Created at:
                        </span>
                        {date}
                      </p>
                      <p className="">
                        <span className="italic font-bold pr-1">
                          Question paper name:
                        </span>
                        {questionPaper.questionPaperName}
                      </p>
                    </div>

                    <DropDownTeacherMenu
                      onDelete={() => deletePaper(questionPaper.id)}
                    />
                  </div>
                  <Button
                    className="w-full cursor-pointer"
                    onClick={() => questionPaperDownload(questionPaper.id)}
                  >
                    Download
                  </Button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default page;
