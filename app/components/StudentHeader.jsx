"use client";
import Image from "next/image";
import storeUser from "@/lib/store/userStore";
import { Plus } from "lucide-react";
import { useState } from "react";
import JoinClassroom from "./JoinClassroom";
import { ModeToggle } from "@/components/ui/ModeToggle";

const StudentHeader = () => {
  const studentInfo = storeUser((state) => state.studentInfo);
  const [showJoinClassroom, setShowJoinClassroom] = useState(false);

  return (
    <div className="w-screen flex-1 flex h-[100px] fixed top-0 items-center justify-center flex-col">
      <header className="flex p-5 w-full items-center flex-row-reverse">
        <div className="flex items-center gap-8">
          <div
            className="p-2 rounded-full hover:bg-gray-100 hover:cursor-pointer transition duration-300 ease-in-out"
            onClick={() => setShowJoinClassroom(true)}
          >
            <Plus size={20} />
          </div>
          <ModeToggle />
          <Image
            src={studentInfo?.image || "/logo.png"}
            height={40}
            width={40}
            alt="logo"
            className="rounded-full"
          />
        </div>
      </header>
      {showJoinClassroom && (
        <JoinClassroom onClose={() => setShowJoinClassroom(false)} />
      )}
    </div>
  );
};

export default StudentHeader;
