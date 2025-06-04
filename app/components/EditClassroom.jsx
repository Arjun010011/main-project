import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
const EditClassroom = ({ onClose, id }) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [classRoomInfo, setClassroomInfo] = useState({
    className: "",
    subjectName: "",
    sectionName: "",
  });

  useEffect(() => {
    const fetchClass = async () => {
      try {
        setLoading(true);
        const data = { id: id };
        const incomingData = await axios.post("/api/classRoom/getClass", data);
        console.log(incomingData);
        if (incomingData) {
          setClassroomInfo(incomingData.data.data);
        }
        setLoading(false);
      } catch (error) {
        if (error?.reponse?.data?.message) {
          setErrorMsg(error?.response?.data?.message);
        }
      }
    };
    fetchClass();
  }, [id]);
  const handleChange = (e) => {
    e.preventDefault();
    const { id, value } = e.target;
    setClassroomInfo((prev) => ({ ...prev, [id]: value }));
  };
  const handleSubmit = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      setErrorMsg("");
      setSuccessMsg("");
      console.log(classRoomInfo);
      const updateUser = await axios.post("/api/classRoom/editClassRoom", {
        id,
        className: classRoomInfo.className,
        subjectName: classRoomInfo.subjectName,
        sectionName: classRoomInfo.sectionName,
      });
      setLoading(false);
      setTimeout(onClose, 1000);
      if (updateUser) {
        setClassroomInfo(updateUser.data.data);
        setSuccessMsg(updateUser.data.message);
        setErrorMsg("");
      }
    } catch (error) {
      setSuccessMsg("");
      if (error?.reponse?.data?.message) {
        setErrorMsg(error?.reponse?.data?.message);
      }
    }
  };
  return (
    <div className=" absolute top-0 w-[100vw] h-[100vh] flex items-center justify-center z-0">
      <div className=" absolute w-full h-full top-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
        <div
          className=" absolute w-full h-full top-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-5"
          onClick={onClose}
        ></div>
        <form
          className="flex flex-col  px-10  py-10 bg-gray-100  z-50 w-auto h-auto rounded-lg md:w-[480px] dark:bg-gray-900 "
          onSubmit={handleSubmit}
        >
          <div className="flex justify-between items-center ">
            <p className="font-bold text-xl">Edit the class </p>
            <X size={25} onClick={onClose} className="hover:cursor-pointer" />
          </div>
          <label htmlFor="className " className="mt-5">
            Class name <span className="text-gray-400">*required</span>
          </label>
          <input
            type="text"
            placeholder="enter you className"
            className="border-3 border-gray-200 rounded-lg px-2 py-2 mt-2 w-[70vw] md:w-full"
            id="className"
            value={classRoomInfo.className || ""}
            required
            onChange={handleChange}
          />
          <label htmlFor="className " className="mt-5">
            Subject
          </label>
          <input
            type="text"
            placeholder="enter your subject"
            className="border-3 border-gray-200 rounded-lg px-2 py-2 mt-2 w-[70vw] md:w-full"
            id="subjectName"
            value={classRoomInfo.subjectName || ""}
            onChange={handleChange}
          />
          <label htmlFor="className " className="mt-5">
            Section
          </label>
          <input
            type="text"
            placeholder="enter you section"
            className="border-3 border-gray-200 rounded-lg px-2 py-2 mt-2 w-[70vw] md:w-full"
            id="sectionName"
            value={classRoomInfo.sectionName || ""}
            onChange={handleChange}
          />
          <Button type="submit" className="mt-7 py-5" disabled={loading}>
            {loading ? "Loading" : "Edit classroom"}
          </Button>
          {successMsg && (
            <motion.div className="mt-5  rounded-sm px-3 py-2 bg-green-300 text-black text-center">
              {successMsg}
            </motion.div>
          )}
          {errorMsg && (
            <div className=" mt-5 px-3 py-2 bg-red-300 text-black">
              {errorMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditClassroom;
