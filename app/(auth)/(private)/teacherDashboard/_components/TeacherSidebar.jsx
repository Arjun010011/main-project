"use client";

import {
  LucideHome,
  FileTextIcon,
  Folder,
  Play,
  PrinterIcon,
  Menu,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";

const teacherSidebar = () => {
  const { classroomId } = useParams();
  const variant = {
    hidden: { x: "-150%" },
    visible: { x: "0%" },
    exit: { x: "-150%" },
  };

  const [open, setOpen] = useState(false);
  return (
    <div>
      <Menu
        className="mt-5 ml-3 fixed top-3 left-5 cursor-pointer"
        size={30}
        onClick={() => setOpen(true)}
      />
      <AnimatePresence>
        <motion.div
          initial="hidden"
          animate={open ? "visible" : "hidden"}
          exit="hidden"
          variants={variant}
          transition={{ type: "tween", duration: "0.5" }}
          className="max-w-[250px] w-full h-[100vh]  bg-gray-50 fixed top-0 left-0   border-1 border-gray-200 dark:bg-gray-800  dark:border-gray-700  "
        >
          <ul className="mt-10 flex flex-col overflow-hidden px-3 text-start gap-5  font-md text-md ">
            <X
              size={30}
              onClick={() => setOpen(false)}
              className="cursor-pointer"
            />
            <Link href={`/teacherDashboard/${classroomId}`}>
              <li className="py-3 flex gap-2 px-2 rounded-md hover:bg-gray-200 transition-colors duration-500 dark:hover:bg-gray-700">
                <LucideHome />
                Dashboard
              </li>
            </Link>
            <Link href={`/teacherDashboard/${classroomId}/createQuesitonPaper`}>
              <li className="py-3 flex gap-2 px-2 rounded-md hover:bg-gray-200 transition-colors duration-500 dark:hover:bg-gray-700">
                <FileTextIcon />
                Create Question Paper
              </li>
            </Link>
            <Link
              href={`/teacherDashboard/${classroomId}/existingQuestionPaper`}
            >
              <li className="py-3 px-2 rounded-md flex gap-2 hover:bg-gray-200 transition-colors duration-500 dark:hover:bg-gray-700">
                <Folder />
                Existing question papers
              </li>
            </Link>
            <li className="py-3 px-2 rounded-md flex gap-2 hover:bg-gray-200 transition-colors duration-500 dark:hover:bg-gray-700">
              <Play />
              Live tests
            </li>
            <li className="py-3 px-2 rounded-md flex gap-2 hover:bg-gray-200 transition-colors duration-500 dark:hover:bg-gray-700">
              <PrinterIcon />
              Print Papers
            </li>
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default teacherSidebar;
