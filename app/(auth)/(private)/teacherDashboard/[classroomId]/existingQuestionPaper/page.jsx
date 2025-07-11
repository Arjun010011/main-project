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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [previewPaperName, setPreviewPaperName] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  // const [liveTests, setLiveTests] = useState([]); // Simulated live tests

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
          pageWidth - 25
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
      { align: "center" }
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

  // Preview handler
  const handlePreview = async (paperId, paperName) => {
    setPreviewLoading(true);
    setShowPreviewModal(true);
    setPreviewPaperName(paperName);
    try {
      const paperInfo = await axios.post("/api/classRoom/fetchQuestionPaper", {
        questionPaperId: paperId,
      });
      setPreviewQuestions(paperInfo.data.questionPaper.questions || []);
    } catch (error) {
      setPreviewQuestions([]);
    } finally {
      setPreviewLoading(false);
    }
  };
  //delete paper
  const deletePaper = async (id) => {
    try {
      const delPaper = await axios.delete(
        "/api/classRoom/deleteQuestionPaper",
        {
          data: { paperId: id },
        }
      );
      if (delPaper.status === 200) {
        console.log("paperDeleted");
      }
    } catch (error) {
      console.error(error);
    }
  };
  // Move to live test handler (backend)
  const handleMoveToLiveTest = async (paper) => {
    try {
      await axios.post("/api/classRoom/moveToLiveTest", {
        questionPaperId: paper.id,
      });
      // Refresh the papers list
      const data = await axios.post("/api/classRoom/fetchQuestionPapers", {
        classroomId,
      });
      setContent(data.data);
    } catch (error) {
      console.error("Failed to move to live test", error);
    }
  };
  if (!content)
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loader className="animate-spin" />
      </div>
    );

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
                "do MMMM yyyy,h:mm a"
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
                      onPreview={() =>
                        handlePreview(
                          questionPaper.id,
                          questionPaper.questionPaperName
                        )
                      }
                      onMoveToLiveTest={() =>
                        handleMoveToLiveTest(questionPaper)
                      }
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
      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0 border border-gray-200 dark:border-gray-800">
            <button
              className="absolute top-3 right-3 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white text-2xl font-bold z-10"
              onClick={() => setShowPreviewModal(false)}
              aria-label="Close preview"
            >
              ×
            </button>
            {/* KCET Paper Header */}
            <div className="px-8 pt-8 pb-4 border-b border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-t-lg">
              <h2 className="text-2xl font-bold text-center font-serif text-black dark:text-white tracking-wide mb-1">
                KCET 2025 Question Paper
              </h2>
              <div className="flex flex-col items-center text-center">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-200 font-serif">
                  PHYSICS (Code: A1)
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-serif">
                  Practice Paper
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-1">
                  {previewPaperName}
                </span>
              </div>
            </div>
            <div className="px-8 py-6 font-serif bg-white dark:bg-gray-900">
              {previewLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader className="animate-spin text-black dark:text-white" />
                </div>
              ) : previewQuestions.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-300">
                  No questions found.
                </div>
              ) : (
                <ol className="space-y-8">
                  {previewQuestions.map((item, idx) => {
                    const q = item.question;
                    return (
                      <li
                        key={item.id}
                        className="pb-4 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="mb-2 text-lg font-semibold text-black dark:text-white">
                          {idx + 1}. {q.Question}
                        </div>
                        <ul className="pl-4 space-y-1">
                          <li className="text-black dark:text-gray-200">
                            A. {q.Option_A}
                          </li>
                          <li className="text-black dark:text-gray-200">
                            B. {q.Option_B}
                          </li>
                          <li className="text-black dark:text-gray-200">
                            C. {q.Option_C}
                          </li>
                          <li className="text-black dark:text-gray-200">
                            D. {q.Option_D}
                          </li>
                        </ul>
                        {q.Explanation && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                            <span className="font-medium">Explanation:</span>{" "}
                            {q.Explanation}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
            {/* KCET Paper Footer */}
            <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-t from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-b-lg text-center font-serif text-gray-600 dark:text-gray-300 text-sm">
              Space For Rough Work
              <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-mono">
                A-1 | 1B0616K22
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default page;
