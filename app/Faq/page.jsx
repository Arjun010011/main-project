"use client";

import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function FAQ() {
  const faqs = [
    {
      question: "What is the main purpose of this project?",
      answer:
        "The primary aim is to design an AI-assisted platform for generating, managing, and analyzing question papers, catering to both teachers and students for competitive exam preparation.",
    },
    {
      question: "Is it production-ready?",
      answer:
        "No. This is a prototype developed for our college project to demonstrate the concept and core features, not for commercial deployment.",
    },
    {
      question: "What technologies were used?",
      answer:
        "We used Next.js for the frontend, Tailwind CSS for styling, Framer Motion for animations, and AI integration for intelligent question generation.",
    },
    {
      question: "Can it handle different exam patterns?",
      answer:
        "Yes. The system can be configured for multiple exams such as JEE, NEET, CET, and others by adjusting the syllabus and question bank.",
    },
    {
      question: "Does it support analytics?",
      answer:
        "Yes, it provides performance analytics to help students understand their strengths, weaknesses, and progress over time.",
    },
    {
      question: "Will this project be open-sourced?",
      answer:
        "There are no current plans for open-sourcing. However, future academic collaborations are possible.",
    },
    {
      question: "Is this project free to use?",
      answer:
        "As of now, it is available only for demonstration purposes during our college evaluation.",
    },
    {
      question: "Who developed this project?",
      answer:
        "This project was developed by our college team as part of our final-year academic submission.",
    },
  ];

  return (
    <div className="w-full min-h-screen overflow-hidden dark:text-white dark:bg-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-6 md:px-20 text-center max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight"
        >
          Your Questions, Answered
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-6 text-lg font-light text-gray-600 dark:text-gray-300"
        >
          Find quick answers to the most common queries about our project.
        </motion.p>
      </section>

      {/* FAQ Cards */}
      <section className="px-6 md:px-20 pb-20 max-w-6xl mx-auto grid gap-8 sm:grid-cols-2">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm flex flex-col gap-3"
          >
            <h3 className="text-lg font-semibold text-black dark:text-white">
              {faq.question}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Contact Section */}
      <section className="px-6 md:px-20 pb-20 text-center max-w-3xl mx-auto">
        <div className="bg-black text-white dark:bg-gray-800 dark:border dark:border-white px-6 py-10 rounded-2xl shadow-md">
          <p className="text-2xl font-bold mb-3">Still have questions?</p>
          <p className="text-gray-300 mb-6">
            If you couldn’t find the answer you were looking for, feel free to
            reach out to us directly.
          </p>
          <p className="font-medium">📧 contact@collegeproject.com</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
