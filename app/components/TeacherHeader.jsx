"use client";
import Image from "next/image";
import storeUser from "@/lib/store/userStore";
import { Menu, Plus, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
const TeacherHeader = () => {
  const { userInfo } = storeUser();
  console.log(userInfo);
  const [plusClick, setPlusClick] = useState(false);
  return (
    <div className="w-full h-full flex items-center justify-center flex-col ">
      <header className="flex p-5 w-full  items-center justify-between ">
        <Menu size={30} />
        <div className="flex items-center gap-8  ">
          <div
            className="p-2 rounded-full hover:bg-gray-100  hover:cursor-pointer transition duration-300 ease-in-out"
            onClick={() =>
              plusClick === false ? setPlusClick(true) : setPlusClick(false)
            }
          >
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
            className=" absolute w-full h-full top-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
          >
            <div
              className=" absolute w-full h-full top-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-0"
              onClick={() => setPlusClick(false)}
            ></div>
            <form className="flex flex-col  px-10  py-10 bg-gray-100  z-50 w-auto h-auto rounded-lg md:w-[480px] ">
              <div className="flex justify-between items-center ">
                <p className="font-bold text-xl">Add a class </p>
                <X
                  size={25}
                  onClick={() => setPlusClick(false)}
                  className="hover:cursor-pointer"
                />
              </div>
              <label htmlFor="className " className="mt-5">
                Class name
              </label>
              <input
                type="text"
                placeholder="enter you className"
                className="border-3 border-gray-200 rounded-lg px-2 py-2 mt-2 w-[70vw] md:w-full"
              />
              <label htmlFor="className " className="mt-5">
                Subject
              </label>
              <input
                type="text"
                placeholder="enter you subject"
                className="border-3 border-gray-200 rounded-lg px-2 py-2 mt-2 w-[70vw] md:w-full"
              />
              <label htmlFor="className " className="mt-5">
                Section
              </label>
              <input
                type="text"
                placeholder="enter you section"
                className="border-3 border-gray-200 rounded-lg px-2 py-2 mt-2 w-[70vw] md:w-full"
              />
              <Button className="mt-7 py-5">Create classroom</Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherHeader;
