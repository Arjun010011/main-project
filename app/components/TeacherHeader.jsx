"use client";
import storeUser from "@/lib/store/userStore";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import axios from "axios";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { AvatarImage, Avatar } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

const TeacherHeader = () => {
  const router = useRouter();
  const { randomBg } = storeUser();
  const teacherInfo = storeUser((state) => state.teacherInfo);
  const logout = storeUser((state) => state.logout);
  const getClassRooms = storeUser((state) => state.getClassRooms);
  const [loading, setLoading] = useState(false);
  const classrooms = storeUser((state) => state.classrooms);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [classroomInfo, setClassroomInfo] = useState({});
  const [plusClick, setPlusClick] = useState(false);

  const handleLogout = async () => {
    logout();
    router.push("/");
  };
  const handleChange = (e) => {
    e.preventDefault();
    const { id, value } = e.target;
    setClassroomInfo((prev) => ({ ...prev, [id]: value }));
  };
  const fetchClassrooms = async () => {
    const teacherEmail = {
      email: teacherInfo.email,
    };
    const classRooms = await axios.post(
      "/api/classRoom/getClass",
      teacherEmail,
    );
    getClassRooms(classRooms.data.classRooms);
  };

  const handleSubmit = async (e) => {
    try {
      console.log(classrooms);
      let image = randomBg();
      console.log(image);
      setLoading(true);
      e.preventDefault();
      const updatedClassroomInfo = {
        ...classroomInfo,
        teacherId: teacherInfo.id,
        image,
      };
      setClassroomInfo(updatedClassroomInfo);
      const classRoom = await axios.post(
        "/api/classRoom/createClassroom",
        updatedClassroomInfo,
      );
      if (classRoom.status === 201) {
        setErrorMsg(null);
        fetchClassrooms();
        setSuccessMsg(classRoom.data.message);
        setTimeout(() => {
          setPlusClick(false);
          setSuccessMsg(null);
        }, 2000);
      } else {
        setErrorMsg(classRoom.data.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setSuccessMsg(null);
      if (error?.response?.data?.message) {
        setErrorMsg(error.response.data.message);

        setTimeout(() => {
          setPlusClick(false);
          setErrorMsg(null);
        }, 2000);
      } else {
        console.error(error);
        setErrorMsg("Something went wrong");
        setTimeout(() => {
          setPlusClick(false);
          setErrorMsg(null);
        }, 2000);
      }
    }
  };
  return (
    <div className="w-screen flex-1 flex  h-[100px]  fixed top-0 items-center justify-center flex-col ">
      <header className="flex p-5 w-full  items-center flex-row-reverse ">
        <div className="flex items-center gap-8  ">
          <div
            className="p-2 rounded-full hover:bg-gray-100  hover:cursor-pointer transition duration-300 ease-in-out"
            onClick={() =>
              plusClick === false ? setPlusClick(true) : setPlusClick(false)
            }
          >
            <Plus size={20} />
          </div>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage
                  src={teacherInfo?.image || "/logo.png"}
                  width={40}
                  height={40}
                  className="rounded-full cursor-pointer"
                />
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-5">
              <DropdownMenuLabel>
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Delete account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/teacherDashboard">
                <DropdownMenuLabel>Go to home</DropdownMenuLabel>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {plusClick && (
        <div className=" absolute  w-screen h-screen top-0  flex items-center justify-center ">
          <div
            className=" fixed w-full h-screen top-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-5"
            onClick={() => setPlusClick(false)}
          ></div>
          <form
            className="flex flex-col  px-10  py-10 bg-gray-100  z-50 w-auto h-auto rounded-lg md:w-[480px] dark:bg-gray-900 "
            onSubmit={handleSubmit}
          >
            <div className="flex justify-between items-center ">
              <p className="font-bold text-xl">Add a class </p>
              <X
                size={25}
                onClick={() => setPlusClick(false)}
                className="hover:cursor-pointer"
              />
            </div>
            <label htmlFor="className " className="mt-5">
              Class name <span className="text-gray-400">*required</span>
            </label>
            <input
              type="text"
              placeholder="enter you className"
              className="border-3 border-gray-200 rounded-lg px-2 py-2 mt-2 w-[70vw] md:w-full"
              id="className"
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
              onChange={handleChange}
            />
            <Button type="submit" className="mt-7 py-5" disabled={loading}>
              {loading ? "Loading" : "create classroom"}
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
      )}
    </div>
  );
};

export default TeacherHeader;
