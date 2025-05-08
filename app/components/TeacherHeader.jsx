"use client";
import Image from "next/image";
import storeUser from "@/lib/store/userStore";
import { Menu, Plus } from "lucide-react";
const TeacherHeader = () => {
  const { userInfo } = storeUser();
  console.log(userInfo);
  return (
    <div>
      <header className="flex m-5   items-center justify-between ">
        <Menu size={30} />
        <div className="flex items-center gap-8  ">
          <div className="p-2 bg-gray-200 rounded-full">
            <Plus size={20} />
          </div>
          <Image
            src={userInfo.image || "/logo.png"}
            height={40}
            width={40}
            alt="logo"
            className="rounded-full"
          />
        </div>
      </header>
    </div>
  );
};

export default TeacherHeader;
