"use client";
import Image from "next/image";
import storeUser from "@/lib/store/userStore";
import { Menu, Plus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const TeacherHeader = () => {
  const { userInfo } = storeUser();
  console.log(userInfo);
  const [plusClick, setPlusClick] = useState(false);
  return (
    <div className="w-full h-full flex items-center justify-center flex-col ">
      <header className="flex p-5 w-full  items-center justify-between ">
        <Menu size={30} />
        <div
          className="flex items-center gap-8  "
          onClick={() =>
            plusClick === false ? setPlusClick(true) : setPlusClick(false)
          }
        >
          <div className="p-2 rounded-full hover:bg-gray-100  hover:cursor-pointer transition duration-300 ease-in-out">
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
      <AnimatePresence>
        {plusClick && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 bg-black text-white"
          >
            hello
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherHeader;
