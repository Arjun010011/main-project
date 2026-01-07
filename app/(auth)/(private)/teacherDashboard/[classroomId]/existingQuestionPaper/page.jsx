"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader, Download, Eye, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import DropDownTeacherMenu from "@/app/components/DropDownTeacherMenu";

import "katex/dist/katex.min.css";
import Latex from "react-latex-next";

function QuestionPaperPage() {
  const params = useParams();
  const classroomId = params.classroomId;
  const [content, setContent] = useState(null);

  // States
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [previewPaperName, setPreviewPaperName] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const { data } = await axios.post(
          "/api/classRoom/fetchQuestionPapers",
          { classroomId }
        );
        setContent(data);
      } catch (error) {
        console.error("Failed to fetch papers:", error);
      }
    };
    fetchPaper();
  }, [classroomId]);

  const groupQuestionsBySubject = (questions) => {
    if (!questions) return {};
    return questions.reduce((groups, item) => {
      const subject =
        item.question.Subject || item.question.subject || "General";
      if (!groups[subject]) groups[subject] = [];
      groups[subject].push(item);
      return groups;
    }, {});
  };

  const handleDownloadPDF = async (paperId, paperName) => {
    setDownloadingId(paperId);
    try {
      const { data } = await axios.post("/api/classRoom/fetchQuestionPaper", {
        questionPaperId: paperId,
      });
      setPrintData({
        name: paperName,
        questions: data.questionPaper.questions || [],
      });
      setTimeout(() => {
        window.print();
        setDownloadingId(null);
      }, 500);
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadingId(null);
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
      console.error("Preview failed:", error);
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
      setContent((prev) => ({
        ...prev,
        questionPaperDetails: prev.questionPaperDetails.filter(
          (p) => p.id !== id
        ),
        totalPaper: prev.totalPaper - 1,
      }));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleMoveToLiveTest = async (paper) => {
    try {
      await axios.post("/api/classRoom/moveToLiveTest", {
        questionPaperId: paper.id,
      });
    } catch (error) {
      console.error("Move to live test failed:", error);
    }
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewQuestions([]);
    setPreviewPaperName("");
  };

  const KcetHeader = ({ paperName }) => (
    <div className="font-serif border-b-2 border-black mb-2 pb-2">
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
          <p className="text-lg font-bold mt-1 uppercase">COMBINED PAPER</p>
          <p className="text-sm italic">({paperName})</p>
        </div>
        <div className="border border-black p-2 w-24 text-center flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase leading-tight">
            Max Marks
          </p>
          <p className="text-xl font-bold">180</p>
        </div>
      </div>
      <div className="grid grid-cols-2 text-sm border-t border-black pt-2">
        <div className="border-r border-black pr-4">
          <div className="flex justify-between mb-1">
            <span className="font-bold">Date: _______________</span>
            <span className="font-bold">Time: 3 Hours</span>
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

  const QuestionDisplay = ({ questions }) => {
    const groupedQuestions = groupQuestionsBySubject(questions);
    
    return (
      <div className="space-y-6">
        {Object.entries(groupedQuestions).map(([subject, subjectQuestions]) => (
          <div key={subject} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-500">
              {subject}
            </h3>
            <div className="space-y-4">
              {subjectQuestions.map((item, idx) => {
                const globalIndex = questions.findIndex((q) => q.id === item.id);
                return (
                  <div key={item.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="flex gap-3">
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-lg shrink-0">
                        {globalIndex + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="mb-3 text-gray-900 dark:text-white">
                          <Latex>{item.question.Question}</Latex>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {['A', 'B', 'C', 'D'].map((option) => (
                            <div 
                              key={option}
                              className="flex gap-2 items-start bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600"
                            >
                              <span className="font-bold text-gray-700 dark:text-gray-300 shrink-0">
                                ({option})
                              </span>
                              <span className="text-gray-800 dark:text-gray-200">
                                <Latex>{item.question[`Option_${option}`]}</Latex>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!content)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="pt-24 lg:pt-28 lg:pl-72 pr-4 sm:pr-6 pb-16 dark:bg-gray-900 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Question Papers
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Total Papers: {content.totalPaper}
        </p>
      </header>

      {content.questionPaperDetails.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No question papers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {content.questionPaperDetails
            .slice()
            .reverse()
            .map((questionPaper) => {
              const date = format(
                new Date(questionPaper.createdAt),
                "do MMMM yyyy, h:mm a"
              );
              const isDownloading = downloadingId === questionPaper.id;
              return (
                <div
                  key={questionPaper.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="p-5 flex-grow">
                    <p className="text-sm font-semibold text-black dark:text-white line-clamp-2">
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
                      <Eye className="w-4 h-4 mr-2" /> Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      disabled={isDownloading}
                      onClick={() =>
                        handleDownloadPDF(
                          questionPaper.id,
                          questionPaper.questionPaperName
                        )
                      }
                    >
                      {isDownloading ? (
                        <Loader className="animate-spin w-4 h-4 mr-2" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}{" "}
                      Download
                    </Button>
                    <DropDownTeacherMenu
                      onDelete={() => deletePaper(questionPaper.id)}
                      onMoveToLiveTest={() => handleMoveToLiveTest(questionPaper)}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={closePreviewModal}
        >
          <div 
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {previewPaperName}
              </h2>
              <button
                onClick={closePreviewModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close preview"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin w-8 h-8 text-blue-500" />
                </div>
              ) : previewQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No questions found in this paper
                  </p>
                </div>
              ) : (
                <QuestionDisplay questions={previewQuestions} />
              )}
            </div>

            {/* Modal Footer */}
            {!previewLoading && previewQuestions.length > 0 && (
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Questions: {previewQuestions.length}
                </p>
                <Button onClick={closePreviewModal}>Close</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HIDDEN PRINT TEMPLATE */}
      <div
        id="printable-paper-container"
        className="hidden print:block font-serif text-black bg-white"
      >
        {printData && (
          <>
            <KcetHeader paperName={printData.name} />
            <div className="text-xs font-serif leading-tight">
              <p className="font-bold mb-1">IMPORTANT INSTRUCTIONS</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>
                  This booklet contains {printData.questions.length} questions.
                </li>
                <li>Use only Black Ball Point Pen.</li>
              </ol>
            </div>

            <hr className="border-t-2 border-black my-4" />

            <div className="print-two-columns text-sm">
              {Object.entries(groupQuestionsBySubject(printData.questions)).map(
                ([subject, questions]) => (
                  <div key={subject} className="mb-6">
                    <div className="subject-header-container">
                      <div className="inline-block border border-black px-6 py-1 bg-white font-bold uppercase text-center relative z-20">
                        {subject}
                      </div>
                    </div>

                    {questions.map((item) => {
                      const globalIndex = printData.questions.findIndex(
                        (q) => q.id === item.id
                      );
                      return (
                        <div key={item.id} className="question-item">
                          <div className="flex gap-2 items-start">
                            <span className="font-bold pt-0.5">
                              {globalIndex + 1}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="mb-2 text-justify">
                                <Latex>{item.question.Question}</Latex>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 ml-1">
                                <div className="flex gap-1">
                                  <span className="font-bold">(A)</span>{" "}
                                  <Latex>{item.question.Option_A}</Latex>
                                </div>
                                <div className="flex gap-1">
                                  <span className="font-bold">(B)</span>{" "}
                                  <Latex>{item.question.Option_B}</Latex>
                                </div>
                                <div className="flex gap-1">
                                  <span className="font-bold">(C)</span>{" "}
                                  <Latex>{item.question.Option_C}</Latex>
                                </div>
                                <div className="flex gap-1">
                                  <span className="font-bold">(D)</span>{" "}
                                  <Latex>{item.question.Option_D}</Latex>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>

            <div className="mt-8 border-t-2 border-dashed border-gray-400 pt-2 text-center text-gray-500 italic text-xs break-inside-avoid">
              <p>Space For Rough Work</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default QuestionPaperPage;
