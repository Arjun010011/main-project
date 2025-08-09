"use client";

import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Users, Target, BookOpen } from "lucide-react";

export default function About() {
  const sections = [
    {
      icon: Target,
      title: "Project Objective",
      desc: "To design and develop an AI-powered platform that assists both teachers and students in creating, managing, and analyzing exam question papers efficiently.",
    },
    {
      icon: BookOpen,
      title: "Learning Scope",
      desc: "This project integrates concepts from web development, UI/UX design, artificial intelligence, and data analytics to provide a functional and user-friendly application.",
    },
    {
      icon: Users,
      title: "Team Contribution",
      desc: "Collaboratively developed by our project team, with responsibilities divided between frontend, backend, and AI integration modules.",
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
          About This Project
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-6 text-lg font-light text-gray-600 dark:text-gray-300"
        >
          This project was created as part of our college coursework to explore
          the use of AI in educational tools. It focuses on making exam
          preparation more efficient for both students and educators.
        </motion.p>
      </section>

      {/* Sections */}
      <section className="px-6 md:px-20 py-16 bg-slate-50 dark:bg-gray-800">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {sections.map((item, i) => (
            <Card key={i} {...item} />
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="px-6 md:px-20 py-16 text-center max-w-4xl mx-auto">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          While this is a prototype, it demonstrates the potential of AI-powered
          educational tools. Our aim is to further refine this system, enhance
          accuracy, and expand its capabilities for real-world classroom use.
        </p>
      </section>

      <Footer />
    </div>
  );
}
