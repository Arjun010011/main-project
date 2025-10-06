"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import DropDownTeacherMenu from "@/app/components/DropDownTeacherMenu";

function QuestionPaperPage() {
  const params = useParams();
  const classroomId = params.classroomId;
  const [content, setContent] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [previewPaperName, setPreviewPaperName] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const { data } = await axios.post(
          "/api/classRoom/fetchQuestionPapers",
          {
            classroomId,
          },
        );
        setContent(data);
      } catch (error) {
        console.error("Failed to fetch question papers:", error);
      }
    };
    fetchPaper();
  }, [classroomId]);

  const generateKCETPaper = (questions) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 25;

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("KCET 2025 Question Paper", pageWidth / 2, 15, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.text("PHYSICS (Code: A1)", pageWidth / 2, 22, { align: "center" });

    questions.forEach((item, index) => {
      const q = item.question;
      doc.setFontSize(11);
      doc.setFont("times", "normal");
      doc.setTextColor(0);

      const questionText = `${index + 1}. ${q.Question}`;
      const questionLines = doc.splitTextToSize(questionText, pageWidth - 20);
      if (y + questionLines.length * 6 > pageHeight - 30) {
        addFooter(doc, pageWidth, pageHeight);
        doc.addPage();
        y = 25;
      }
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
        if (y + optLines.length * 6 > pageHeight - 30) {
          addFooter(doc, pageWidth, pageHeight);
          doc.addPage();
          y = 25;
        }
        doc.text(optLines, 20, y);
        y += optLines.length * 6;
      });

      y += 6;
    });

    addFooter(doc, pageWidth, pageHeight);
    doc.save("KCET_Question_Paper.pdf");
  };

  const addFooter = (doc, pageWidth, pageHeight) => {
    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.text("Space For Rough Work", pageWidth / 2, pageHeight - 20, {
      align: "center",
    });
    doc.setFontSize(9);
    doc.setFont("times", "normal");
    doc.text("A-1", 10, pageHeight - 10);
    doc.text(
      String(doc.internal.getNumberOfPages()),
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );
    doc.text("1B0616K22", pageWidth - 10, pageHeight - 10, { align: "right" });
  };

  const questionPaperDownload = async (paperId) => {
    try {
      const { data } = await axios.post("/api/classRoom/fetchQuestionPaper", {
        questionPaperId: paperId,
      });
      generateKCETPaper(data.questionPaper.questions);
    } catch (error) {
      console.error("Failed to download paper:", error);
    }
  };

  const handlePreview = async (paperId, paperName) => {
    setPreviewPaperName(paperName);
    setShowPreviewModal(true);
    setPreviewLoading(true);
    try {
      const { data } = await axios.post("/api/classRoom/fetchQuestionPaper", {
        questionPaperId: paperId,
      });
      setPreviewQuestions(data.questionPaper.questions || []);
    } catch (error) {
      console.error("Failed to fetch preview:", error);
      setPreviewQuestions([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const deletePaper = async (id) => {
    try {
      await axios.delete("/api/classRoom/deleteQuestionPaper", {
        data: { paperId: id },
      });
      setContent((prevContent) => ({
        ...prevContent,
        questionPaperDetails: prevContent.questionPaperDetails.filter(
          (p) => p.id !== id,
        ),
        totalPaper: prevContent.totalPaper - 1,
      }));
    } catch (error) {
      console.error("Failed to delete paper:", error);
    }
  };

  const handleMoveToLiveTest = async (paper) => {
    try {
      await axios.post("/api/classRoom/moveToLiveTest", {
        questionPaperId: paper.id,
      });
      // You might want to update the state to reflect this change
    } catch (error) {
      console.error("Failed to move to live test", error);
    }
  };

  if (!content) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-gray-50 dark:bg-gray-900">
        <Loader className="animate-spin text-black" size={48} />
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-28 lg:pl-72 pr-4 sm:pr-6 pb-16 dark:bg-gray-900 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Question Papers
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Manage, preview, and download your generated question papers.
        </p>
        <p className="mt-4 text-sm font-medium text-gray-800 dark:text-gray-200">
          Total Papers:{" "}
          <span className="font-bold text-black dark:text-white">
            {content?.totalPaper ?? 0}
          </span>
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {content.questionPaperDetails
          .slice()
          .reverse()
          .map((questionPaper) => {
            const date = format(
              new Date(questionPaper.createdAt),
              "do MMMM yyyy, h:mm a",
            );
            return (
              <div
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
                key={questionPaper.id}
              >
                <div className="p-5 flex-grow">
                  <p className="text-sm font-semibold text-black dark:text-white">
                    {questionPaper.questionPaperName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Created: {date}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      handlePreview(
                        questionPaper.id,
                        questionPaper.questionPaperName,
                      )
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => questionPaperDownload(questionPaper.id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <DropDownTeacherMenu
                    onDelete={() => deletePaper(questionPaper.id)}
                    onMoveToLiveTest={() => handleMoveToLiveTest(questionPaper)}
                  >
                    {/* Assuming DropDownTeacherMenu has a trigger child */}
                  </DropDownTeacherMenu>
                </div>
              </div>
            );
          })}
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <header className="sticky top-0 z-10 px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {previewPaperName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Paper Preview
                </p>
              </div>
              <button
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setShowPreviewModal(false)}
                aria-label="Close preview"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </header>

            <div className="p-6 sm:p-8 font-serif">
              {previewLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader className="animate-spin text-black" size={32} />
                </div>
              ) : previewQuestions.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                  No questions found for this paper.
                </div>
              ) : (
                <ol className="space-y-8">
                  {previewQuestions.map((item, idx) => (
                    <li
                      key={item.id}
                      className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <p className="mb-4 text-base font-medium text-gray-800 dark:text-gray-200">
                        <span className="font-bold">{idx + 1}.</span>{" "}
                        {item.question.Question}
                      </p>
                      <ul className="pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>(A) {item.question.Option_A}</li>
                        <li>(B) {item.question.Option_B}</li>
                        <li>(C) {item.question.Option_C}</li>
                        <li>(D) {item.question.Option_D}</li>
                      </ul>
                      {item.question.Explanation && (
                        <div className="mt-4 p-3 rounded-md bg-indigo-50 dark:bg-black/20 text-sm text-black dark:text-white">
                          <span className="font-semibold">Explanation:</span>{" "}
                          {item.question.Explanation}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionPaperPage;
