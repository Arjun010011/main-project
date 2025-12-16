"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
// Removed jsPDF import
import DropDownTeacherMenu from "@/app/components/DropDownTeacherMenu";

// Imports for the Printable Paper Layout
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";

function QuestionPaperPage() {
  const params = useParams();
  const classroomId = params.classroomId;
  const [content, setContent] = useState(null);

  // Preview States (Left Unchanged)
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [previewPaperName, setPreviewPaperName] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // New States for Printing
  const [downloadingId, setDownloadingId] = useState(null); // Tracks WHICH button is loading
  const [printData, setPrintData] = useState(null); // Stores data for the hidden print view

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const { data } = await axios.post(
          "/api/classRoom/fetchQuestionPapers",
          {
            classroomId,
          }
        );
        setContent(data);
      } catch (error) {
        console.error("Failed to fetch question papers:", error);
      }
    };
    fetchPaper();
  }, [classroomId]);

  // --- NEW: Handle Print/Download Logic ---
  const handleDownloadPDF = async (paperId, paperName) => {
    // 1. Set the loading state ONLY for this specific paper ID
    setDownloadingId(paperId);

    try {
      // 2. Fetch the full questions for the paper
      const { data } = await axios.post("/api/classRoom/fetchQuestionPaper", {
        questionPaperId: paperId,
      });

      // 3. Update the hidden print template with this data
      setPrintData({
        name: paperName,
        questions: data.questionPaper.questions || [],
      });

      // 4. Wait a brief moment for React to render the hidden view, then Print
      setTimeout(() => {
        window.print();
        setDownloadingId(null); // Turn off loading after print dialog opens
      }, 500);
    } catch (error) {
      console.error("Failed to download paper:", error);
      setDownloadingId(null);
    }
  };

  // --- EXISTING: Preview Logic (Unchanged) ---
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
          (p) => p.id !== id
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
    } catch (error) {
      console.error("Failed to move to live test", error);
    }
  };

  // --- KCET Header Component for Print View ---
  const KcetHeader = ({ paperName }) => (
    <div className="font-serif border-b-2 border-black mb-6 pb-2">
      <div className="flex justify-between items-stretch mb-2">
        <div className="border border-black p-2 w-24 text-center flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase leading-tight">
            Subject Code
          </p>
          <p className="text-xl font-bold">33</p>
        </div>
        <div className="text-center flex-1 px-4 self-center">
          <h1 className="text-2xl font-bold tracking-widest">
            CET EXAMINATION - 2025
          </h1>
          <p className="text-xl font-bold mt-1 uppercase">PHYSICS</p>
          <p className="text-sm italic">({paperName})</p>
        </div>
        <div className="border border-black p-2 w-24 text-center flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase leading-tight">
            Max Marks
          </p>
          <p className="text-xl font-bold">60</p>
        </div>
      </div>
      <div className="grid grid-cols-2 text-sm border-t border-black pt-2">
        <div className="border-r border-black pr-4">
          <div className="flex justify-between mb-1">
            <span className="font-bold">Date: _______________</span>
            <span className="font-bold">Time: 1 hr 10 min</span>
          </div>
        </div>
        <div className="pl-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold">Version Code:</span>
            <span className="bg-black text-white px-3 py-0.5 font-bold text-lg">
              A-1
            </span>
          </div>
          <div>
            <span className="font-bold">Serial No:</span> ____________
          </div>
        </div>
      </div>
    </div>
  );

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
              "do MMMM yyyy, h:mm a"
            );
            // Check if THIS specific paper is currently downloading
            const isThisPaperDownloading = downloadingId === questionPaper.id;

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
                        questionPaper.questionPaperName
                      )
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>

                  {/* Updated Download Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    disabled={isThisPaperDownloading} // Disable ONLY this button
                    onClick={() =>
                      handleDownloadPDF(
                        questionPaper.id,
                        questionPaper.questionPaperName
                      )
                    }
                  >
                    {isThisPaperDownloading ? (
                      <Loader className="animate-spin w-4 h-4 mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Download
                  </Button>

                  <DropDownTeacherMenu
                    onDelete={() => deletePaper(questionPaper.id)}
                    onMoveToLiveTest={() => handleMoveToLiveTest(questionPaper)}
                  ></DropDownTeacherMenu>
                </div>
              </div>
            );
          })}
      </div>

      {/* --- PREVIEW MODAL (Unchanged) --- */}
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

      {/* --- HIDDEN PRINT TEMPLATE --- */}
      {/* This section only becomes visible when window.print() is called */}
      <div
        id="printable-paper-container"
        className="hidden print:block font-serif text-black bg-white p-8"
      >
        {printData && (
          <>
            <KcetHeader paperName={printData.name} />

            <div className="text-xs mb-6 font-serif leading-tight border-b-2 border-dashed border-gray-400 pb-4">
              <p className="font-bold mb-1">
                IMPORTANT INSTRUCTIONS TO CANDIDATES
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>
                  This question booklet contains {printData.questions.length}{" "}
                  questions and each question carries 1 mark.
                </li>
                <li>
                  Check that the Booklet does not have any unprinted or torn or
                  missing pages.
                </li>
                <li>
                  Use only Black Ball Point Pen to darken the circles in the OMR
                  Sheet.
                </li>
              </ol>
            </div>

            <div className="text-sm">
              {printData.questions.map((item, index) => (
                <div key={index} className="question-item mb-4 pb-2">
                  <div className="flex gap-2">
                    <span className="font-bold">{index + 1}.</span>
                    <div className="flex-1">
                      <div className="mb-2 text-justify">
                        <Latex>{item.question.Question}</Latex>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 ml-4">
                        <div className="flex gap-2">
                          <span className="font-bold">(A)</span>{" "}
                          <Latex>{item.question.Option_A}</Latex>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold">(B)</span>{" "}
                          <Latex>{item.question.Option_B}</Latex>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold">(C)</span>{" "}
                          <Latex>{item.question.Option_C}</Latex>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold">(D)</span>{" "}
                          <Latex>{item.question.Option_D}</Latex>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 border-t-2 border-dashed border-gray-400 pt-2 text-center text-gray-500 italic text-xs break-inside-avoid">
              <p>Space For Rough Work</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default QuestionPaperPage;
