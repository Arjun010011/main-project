"use client";
import Image from "next/image";
import storeUser from "@/lib/store/userStore";
import { Menu, Plus } from "lucide-react";
const StudentHeader = () => {
  const studentInfo = storeUser((state) => state.studentInfo);
  return (
    <div className="w-full h-full flex items-center justify-center flex-col ">
      <header className="flex p-5 w-full  items-center justify-between ">
        <Menu size={30} />
        <div className="flex items-center gap-8  ">
          <div className="p-2 rounded-full hover:bg-gray-100  hover:cursor-pointer transition duration-300 ease-in-out">
            <Plus size={20} />
          </div>
          <Image
            src={studentInfo?.image || "/logo.png"}
            height={40}
            width={40}
            alt="logo"
            className="rounded-full"
          />
        </div>
      </header>
      {studentInfo.fullName}
    </div>
  );
};

export default StudentHeader;
