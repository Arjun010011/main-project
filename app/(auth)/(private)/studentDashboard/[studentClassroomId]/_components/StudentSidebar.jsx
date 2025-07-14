"use client";

import {
  Folder,
  Play,
  Users,
  Menu,
  X,
  FileTextIcon,
  Award,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";

const StudentSidebar = () => {
  const { studentClassroomId } = useParams();
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
            <Link href={`/studentDashboard/${studentClassroomId}`}>
              <li className="py-3 flex gap-2 px-2 rounded-md hover:bg-gray-200 transition-colors duration-500 dark:hover:bg-gray-700">
                <FileTextIcon />
                Tests
              </li>
            </Link>
            <Link
              href={`/studentDashboard/${studentClassroomId}/completedTests`}
            >
              <li className="py-3 px-2 rounded-md flex gap-2 hover:bg-gray-200 transition-colors duration-500 dark:hover:bg-gray-700">
                <Award />
                Completed Tests
              </li>
            </Link>
            <Link href={`/studentDashboard/${studentClassroomId}/classmates`}>
              <li className="py-3 px-2 rounded-md flex gap-2 hover:bg-gray-200 transition-colors duration-500 dark:hover:bg-gray-700">
                <Users />
                Classmates
              </li>
            </Link>
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StudentSidebar;
