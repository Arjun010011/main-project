"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useParams } from "next/navigation";
import { FlaskConical, Calculator, AtomIcon } from "lucide-react";
import { useState } from "react";

function Page() {
  const params = useParams();
  const classroomId = params.classroomId;

  const [message, setMessage] = useState("");
  const [errmsg, setErrmsg] = useState("");
  const [prompt, setPrompt] = useState("");
  const [questionPaperName, setQuestionPaperName] = useState("");

  const [subject, setSubject] = useState({
    physics: false,
    chemistry: false,
    mathematics: false,
  });

  const [quesitonParameters, setQuestionParamters] = useState([]);

  // Collect question metadata
  const quesitonPaperData = (e) => {
    setQuestionParamters((prev) => {
      const updated = [...prev];
      const index = updated.findIndex(
        (item) =>
          item.subject === e.target.dataset.subject &&
          item.difficulty === e.target.dataset.difficulty,
      );
      if (index !== -1) {
        updated[index].number_of_questions = Number(e.target.value);
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

  // Submit config to backend
  const getQuestionPaper = async (e) => {
    e.preventDefault();

    try {
      const sendData = {
        classroomId,
        questionInput: quesitonParameters,
        questionPaperName,
        prompt,
      };

      const res = await axios.post(
        "/api/classRoom/question_generation",
        sendData,
      );

      if (res.status === 200) {
        setMessage(
          "Question paper created successfully. You can download it from the 'Print Paper' section.",
        );
        setPrompt("");
        setQuestionPaperName("");
        setSubject({
          physics: false,
          chemistry: false,
          mathematics: false,
        });
        setErrmsg("");
      } else {
        setErrmsg("Question paper creation failed. Please try again later.");
        setMessage("");
      }
    } catch (error) {
      setErrmsg("Something went wrong. Please try again.");
      setMessage("");
      console.error(error);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 min-h-screen pt-[100px] px-5 flex flex-col items-center min-lg:pl-[270px]">
      <div className="w-full">
        <p className="font-bold text-2xl pb-3">Create Question Paper</p>
        <p className="italic font-light mb-4">
          Configure your preferences and generate a custom paper
        </p>
      </div>

      <form
        onSubmit={getQuestionPaper}
        className="w-full border p-5 rounded-md max-w-4xl"
      >
        <div className="mb-6">
          <p className="font-semibold mb-2">Question Paper Name</p>
          <input
            type="text"
            className="border border-gray-300 p-2 w-full rounded-md"
            required
            onChange={(e) => setQuestionPaperName(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <p className="font-semibold mb-2">
            Add AI prompt to filter questions intelligently(choose or for manual
            input)
          </p>
          <textarea
            rows={3}
            className="border border-gray-300 p-2 w-full rounded-md text-sm"
            placeholder="E.g., questions from thermodynamics, Newton's laws, trigonometry"
            onChange={(e) => setPrompt(e.target.value)}
          />
          {prompt && (
            <div className="text-xs text-blue-600 mt-1">
              AI filtering will be applied based on this prompt.
            </div>
          )}
        </div>
        <div className="w-full flex items-center justify-center gap-3">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700 rounded-full"></div>
          <p className="dark:text-white text-black mx-auto">Or</p>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700 rounded-full"></div>
        </div>
        <div className="mb-6">
          <p className="font-semibold mb-3">Select Subjects</p>
          <div className="flex flex-wrap gap-4">
            {[
              { key: "physics", icon: <AtomIcon />, label: "Physics" },
              { key: "chemistry", icon: <FlaskConical />, label: "Chemistry" },
              {
                key: "mathematics",
                icon: <Calculator />,
                label: "Mathematics",
              },
            ].map(({ key, icon, label }) => (
              <label
                key={key}
                className="flex items-center space-x-2 border px-5 py-2 rounded-md cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={subject[key]}
                  onChange={() =>
                    setSubject((subject) => ({
                      ...subject,
                      [key]: !subject[key],
                    }))
                  }
                />
                {icon}
                <span className="capitalize">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subject Difficulty Config */}
        {["Physics", "Mathematics", "Chemistry"].map((sub) => {
          const key = sub.toLowerCase();
          if (!subject[key]) return null;
          return (
            <div key={key} className="mt-6">
              <p className="font-semibold flex gap-2 items-center">
                {sub === "Physics" ? (
                  <AtomIcon />
                ) : sub === "Mathematics" ? (
                  <Calculator />
                ) : (
                  <FlaskConical />
                )}
                {sub} Configuration
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                {["Easy", "Medium", "Hard"].map((level) => (
                  <div key={level} className="flex flex-col w-full">
                    <label className="capitalize italic text-sm mb-1">
                      {level} questions
                    </label>
                    <input
                      className="border border-gray-300 rounded-md p-2"
                      type="number"
                      min={0}
                      data-subject={sub}
                      data-difficulty={level}
                      onChange={quesitonPaperData}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-6 flex items-center justify-center">
          <Button type="submit" className="px-6">
            Generate Question Paper
          </Button>
        </div>
      </form>

      {message && (
        <div className="mt-6 bg-green-500 text-white px-6 py-3 rounded shadow-md text-sm">
          {message}
        </div>
      )}

      {errmsg && (
        <div className="mt-6 bg-red-500 text-white px-6 py-3 rounded shadow-md text-sm">
          {errmsg}
        </div>
      )}
    </div>
  );
}

export default Page;
