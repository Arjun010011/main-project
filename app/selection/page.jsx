"use client";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCapIcon,
  Check,
  TrendingUpIcon,
  UserIcon,
  TrophyIcon,
  GroupIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
const page = () => {
  return (
    <div className="max-w-full overflow-x-hidden">
      <Header />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="w-full h-auto px-5 py-10 flex flex-col gap-4 text-center">
          <p className="font-extrabold text-4xl md:text-7xl">
            Choose your path
          </p>
          <p>
            Join our educational platform and unlock your potential. Select your
            role to get started with personalized analytics and learning
            experience.
          </p>
        </div>
        <div className="p-5 flex flex-col gap-5 md:flex-row md:px-20 md:flex md:items-center md:justify-center ">
          <div className="border border-black rounded-lg p-5 flex flex-col gap-3  md:pr-50">
            <div className="p-5 bg-slate-100 w-fit rounded-full">
              <GraduationCapIcon size={30} />
            </div>
            <p className="text-4xl font-extrabold">Student</p>
            <ul>
              <li className="flex  gap-2 font-extralight">
                <Check size={20} />
                Track your learning progress
              </li>
              <li className="flex  gap-2  font-extralight">
                <Check size={20} />
                Access study materials
              </li>
              <li className="flex  gap-2 font-extralight">
                <Check size={20} />
                Connect with teachers
              </li>
            </ul>
            <Link href="/studentSignup">
              <Button className="mt-5 md:w-[200px]">Signup as a Student</Button>
            </Link>
          </div>
          <div className="border border-black rounded-lg p-5 flex flex-col gap-3 md:pr-50">
            <div className="p-5 bg-slate-100 w-fit rounded-full">
              <GroupIcon size={30} />
            </div>
            <p className="text-4xl font-extrabold">Teacher</p>
            <ul>
              <li className="flex  gap-2 font-extralight">
                <Check size={20} />
                Monitor student progress
              </li>
              <li className="flex  gap-2  font-extralight">
                <Check size={20} />
                Create course content
              </li>
              <li className="flex  gap-2 font-extralight">
                <Check size={20} />
                Advanced analytics tools
              </li>
            </ul>
            <Link href="/teacherSignup">
              <Button className="mt-5 md:w-[200px]">Signup as a Teacher</Button>
            </Link>
          </div>
        </div>
        <div className=" flex flex-col text-center md:items-center md:justify-center">
          <p className="text-4xl  font-extrabold md:text-center md:mt-15">
            Platform Features
          </p>
          <div className="p-5 flex flex-col gap-5 md:flex-row md:my-10">
            <div className="p-5 border border-black rounded-lg flex flex-col gap-3">
              <TrendingUpIcon size={30} />
              <p className="text-2xl font-extrabold">
                Performance and analytics
              </p>
              <p className="font-extralight">
                Track progress and identify areas for improvement with detailed
                analytics.
              </p>
            </div>
            <div className="p-5 border border-black rounded-lg flex flex-col gap-3">
              <UserIcon size={30} />
              <p className="text-2xl font-extrabold">Interactive Learning</p>
              <p className="font-extralight">
                Engage in collaborative learning experiences with peers and
                educators.
              </p>
            </div>
            <div className="p-5 border border-black rounded-lg flex flex-col gap-3">
              <TrophyIcon size={30} />
              <p className="text-2xl font-extrabold">Achievement System</p>
              <p className="font-extralight">
                Earn badges and certificates as you progress through your
                learning journey.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default page;
