"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  Users,
  FileText,
  BarChart3,
  GraduationCap,
  Clock,
  Download,
  Brain,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Features() {
  const teacherFeatures = [
    {
      icon: Users,
      title: "Classroom Creation & Management",
      desc: "Set up classrooms in seconds and share unique join codes for students to access instantly.",
    },
    {
      icon: Brain,
      title: "AI-Powered Paper Generation",
      desc: "Describe your requirements — Gemini AI generates a balanced, difficulty-graded question paper instantly.",
    },
    {
      icon: FileText,
      title: "Manual Question Builder",
      desc: "Select questions manually by subject and difficulty for fully customized papers.",
    },
    {
      icon: Download,
      title: "PDF Preview & Download",
      desc: "View papers online or download them in clean, printer-ready PDF format.",
    },
    {
      icon: Clock,
      title: "Live Test Scheduling",
      desc: "Publish tests instantly or schedule them for later, with automatic student notifications.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      desc: "View AI-driven insights and overall performance summaries for your class.",
    },
  ];

  const studentFeatures = [
    {
      icon: ClipboardList,
      title: "Instant Classroom Access",
      desc: "Join any classroom using your teacher’s code — no complicated setup required.",
    },
    {
      icon: Clock,
      title: "Live Test Participation",
      desc: "Attempt tests in real-time with automatic submission and scoring.",
    },
    {
      icon: BarChart3,
      title: "Personalized Analytics",
      desc: "See strengths, weaknesses, and recommended improvements instantly.",
    },
    {
      icon: GraduationCap,
      title: "Progress Tracking",
      desc: "Track your performance over time and measure your growth.",
    },
  ];

  const Card = ({ icon: Icon, title, desc }) => (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/20 rounded-lg p-6 shadow-md flex flex-col items-start"
    >
      <Icon size={28} className="text-black dark:text-white mb-4" />
      <h3 className="text-lg font-semibold text-black dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">{desc}</p>
    </motion.div>
  );

  return (
    <div className="w-full min-h-screen overflow-hidden dark:text-white dark:bg-gray-800">
      <Header />

      {/* Hero */}
      <section className="py-20 px-6 md:px-20 text-center max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight"
        >
          Minimal Features. <br /> Maximum Impact.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-6 text-lg font-light text-gray-600 dark:text-gray-300"
        >
          Everything you need for KCET preparation — clean, fast, and built for
          real results.
        </motion.p>
      </section>

      {/* Teacher Features */}
      <section className="px-6 md:px-20 py-16 bg-slate-50 dark:bg-gray-800">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          For Teachers
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {teacherFeatures.map((feature, i) => (
            <Card key={i} {...feature} />
          ))}
        </div>
      </section>

      {/* Student Features */}
      <section className="px-6 md:px-20 py-16 bg-white dark:bg-gray-800">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          For Students
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {studentFeatures.map((feature, i) => (
            <Card key={i} {...feature} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="p-5 w-full h-auto md:p-15 dark:bg-gray-800 ">
        <div className="bg-black text-white px-5 py-10 rounded-2xl flex flex-col gap-2 md:p-15 text-center md:items-center md:gap-5 dark:border dark:border-white/20 dark:bg-gray-800">
          <p className="font-extrabold text-2xl md:text-5xl md:leading-[4rem] ">
            Ready to transform your <br />
            exam preparation?
          </p>
          <p>Join thousands of students already using our platform</p>
          <Link href="/selection">
            <Button variant="secondary" className="md:w-[200px]">
              Get started free
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
