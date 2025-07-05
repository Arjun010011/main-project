"use client";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useParams } from "next/navigation";
import { FlaskConical, Calculator, AtomIcon } from "lucide-react";
import { useState } from "react";
function page() {
  const params = useParams();
  const classroomId = params.classroomId;
  const [message, setMessage] = useState("");
  const [errmsg, setErrmsg] = useState("");
  const [subject, setSubject] = useState({
    physics: false,
    chemistry: false,
    mathematics: false,
  });
  const [quesitonParameters, setQuestionParamters] = useState([]);
  const [questionPaperName, setQuestionPaperName] = useState("");
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
      const sendData = {
        classroomId: classroomId,
        questionInput: quesitonParameters,
        questionPaperName: questionPaperName,
      };
      const res = await axios.post(
        "/api/classRoom/question_generation",
        sendData,
      );
      console.log();
      if (res.status === 200) {
        setMessage(
          "question paper created successfully,download it from print paper section",
        );
      }
      if (res.status !== 200) {
        setErrmsg("question paper is not created please try again later");
      }
    } catch (error) {
      console.error(error);
    }
  };
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
        <div className="flex flex-col ">
          <p className="font-semibold my-3">Enter the question paper name</p>
          <input
            type="text"
            required
            className="border-1 border-r-gray-200 p-2 rounded-md"
            onChange={(e) => setQuestionPaperName(e.target.value)}
          />
        </div>
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
      {message && (
        <div className="flex items-center text-center font-medium bg-green-500 text-white px-7 mt-5 py-3  shadow-md rounded-md">
          {message}
        </div>
      )}
      {errmsg && (
        <div className="flex items-center text-center font-medium bg-red-500 text-white px-7 py-3 mt-5 shadow-md rounded-md">
          {errmsg}
        </div>
      )}
    </div>
  );
}

export default page;
