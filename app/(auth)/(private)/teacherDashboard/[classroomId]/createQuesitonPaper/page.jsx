"use client";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { FlaskConical, Calculator, AtomIcon } from "lucide-react";
import { useState } from "react";
import { jsPDF } from "jspdf";
function page() {
  const [subject, setSubject] = useState({
    physics: false,
    chemistry: false,
    mathematics: false,
  });
  const [quesitonParameters, setQuestionParamters] = useState([]);

  // collecting an array of question paper parameters
  const quesitonPaperData = (e) => {
    setQuestionParamters((quesitonParameters) => {
      const updated = [...quesitonParameters];
      const index = updated.findIndex(
        (item) =>
          item.subject === e.target.dataset.subject &&
          item.difficulty === e.target.dataset.difficulty,
      );
      if (index !== -1) {
        updated[index].number_of_quesitons = Number(e.target.value);
      } else {
        updated.push({
          subject: e.target.dataset.subject,
          difficulty: e.target.dataset.difficulty,
          number_of_questions: Number(e.target.value),
        });
      }
      return updated;
    });
  };
  // it is used to get the question paper data from backend
  const getQuestionPaper = async (e) => {
    try {
      e.preventDefault();
      const res = await axios.post(
        "/api/classRoom/question_generation",
        quesitonParameters,
      );
      generateQuestionPaper(res.data.questionPaper);
    } catch (error) {
      console.error(error);
    }
  };
  // it creates the question paper pdf

  function generateQuestionPaper(questions) {
    const doc = new jsPDF();

    const subject = questions[0]?.Subject || "Subject";

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Sample School / College", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.text(`Subject: ${subject}`, 20, 35);
    doc.text("Duration: 1 Hour", 150, 35);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Question Paper", 105, 50, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);

    // Questions
    let y = 70;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    questions.forEach((q, index) => {
      const questionText = `${index + 1}. ${q.Question}`;
      const options = [
        `A. ${q.Option_A}`,
        `B. ${q.Option_B}`,
        `C. ${q.Option_C}`,
        `D. ${q.Option_D}`,
      ];

      // Wrap long text
      const questionLines = doc.splitTextToSize(questionText, 170);
      doc.text(questionLines, 20, y);
      y += questionLines.length * 8;

      options.forEach((opt) => {
        const optLines = doc.splitTextToSize(opt, 170);
        doc.text(optLines, 30, y);
        y += optLines.length * 8;
      });

      y += 5;

      // Page break if needed
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    // Save
    doc.save(`${subject}_Question_Paper.pdf`);
  }
  return (
    <div className=" bg-gray-50  min-h-screen  flex flex-col pt-[100px] dark:bg-gray-800 min-lg:pl-[270px]  px-5  items-center  overflow-x-hidden">
      <div className="flex flex-col w-full h-full ">
        <p className="font-bold text-2xl pb-3 ">Create Quesiton Paper</p>
        <p className="italic font-light">
          Configure your question paper parameters and generate customized
          assemscreen
        </p>
      </div>
      <form
        className="w-full h-full flex flex-col mt-15 border-1 border-bg-gray-300 p-5 max-sm:w-[90vw] "
        onSubmit={getQuestionPaper}
      >
        <p className="text-xl font-bold">
          Fill the option according to your requirement
        </p>
        <div className="">
          <p className="font-semibold  py-5">Select Subject</p>
          <div className=" flex  flex-1 justify-between gap-5 w-full max-md:flex-col ">
            <div className="flex-1 flex gap-2 italic font-medium border-1 border-b-gray-300  px-7 py-3 max-sm:px-3 rounded-md   ">
              <input
                type="checkbox"
                onClick={() =>
                  subject.physics === false
                    ? setSubject((subject) => ({ ...subject, physics: true }))
                    : setSubject((subject) => ({ ...subject, physics: false }))
                }
              />
              <AtomIcon />
              Physics
            </div>
            <div className="flex-1 gap-2 italic font-medium border-1 border-b-gray-300  px-7 py-3 max-sm:px-3 rounded-md  flex">
              <input
                type="checkbox"
                onClick={() =>
                  subject.chemistry === false
                    ? setSubject((subject) => ({ ...subject, chemistry: true }))
                    : setSubject((subject) => ({
                        ...subject,
                        chemistry: false,
                      }))
                }
              />
              <FlaskConical />
              Chemistry
            </div>
            <div className="flex-1 gap-2 italic font-medium border-1 border-b-gray-300  px-7 py-3 max-sm:px-3 rounded-md  flex">
              <input
                type="checkbox"
                onClick={() =>
                  subject.mathematics === false
                    ? setSubject((subject) => ({
                        ...subject,
                        mathematics: true,
                      }))
                    : setSubject((subject) => ({
                        ...subject,
                        mathematics: false,
                      }))
                }
              />
              <Calculator />
              Mathematics
            </div>
          </div>
        </div>

        {/* Physics configuration */}
        <div className={`mt-15 ${subject.physics ? "block" : "hidden"} `}>
          <div className="flex gap-2 font-semibold text-md ">
            <AtomIcon />
            Physics configuration
          </div>
          <div className="flex flex-1 max-md:flex-col">
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              easy quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
                data-subject="Physics"
                data-difficulty="Easy"
                onChange={quesitonPaperData}
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              medium quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
                data-subject="Physics"
                data-difficulty="Medium"
                onChange={quesitonPaperData}
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              hard quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
                data-subject="Physics"
                data-difficulty="Hard"
                onChange={quesitonPaperData}
              />
            </div>
          </div>
        </div>
        {/* Mathematics configuration */}
        <div className={`mt-15 ${subject.mathematics ? "block" : "hidden"} `}>
          <div className="flex gap-2 font-semibold text-md">
            <Calculator />
            Mathematics configuration
          </div>
          <div className="flex flex-1 max-md:flex-col">
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              easy quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
                data-subject="Mathematics"
                data-difficulty="Easy"
                onChange={quesitonPaperData}
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              medium quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
                data-subject="Mathematics"
                data-difficulty="Medium"
                onChange={quesitonPaperData}
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              hard quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
                data-subject="Mathematics"
                data-difficulty="Hard"
                onChange={quesitonPaperData}
              />
            </div>
          </div>
        </div>
        {/* Chemistry configuration */}
        <div className={`mt-15 ${subject.chemistry ? "block" : "hidden"} `}>
          <div className="flex gap-2 font-semibold text-md">
            <FlaskConical />
            Chemistry configuration
          </div>
          <div className="flex flex-1 max-md:flex-col ">
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              easy quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
                data-subject="Chemistry"
                data-difficulty="Easy"
                onChange={quesitonPaperData}
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              medium quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
                data-subject="Chemistry"
                data-difficulty="Medium"
                onChange={quesitonPaperData}
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              hard quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
                data-subject="Chemistry"
                data-difficulty="Hard"
                onChange={quesitonPaperData}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Button type="submit" className="mt-5">
            generate question paper
          </Button>
        </div>
      </form>
    </div>
  );
}

export default page;
