"use client";
import { BookOpen, Trophy, Users, Clock, Star, Target } from "lucide-react";
import StudentHeader from "@/app/components/StudentHeader";
import StudentClassrooms from "@/app/components/StudentClassrooms";
import { motion } from "framer-motion";

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative">
      {/* Header with lower z-index */}
      <div className="relative z-10">
        <StudentHeader />
      </div>

      {/* Main content with even lower z-index */}
      <div className="relative z-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Welcome Header */}
          <div className="mb-12 mt-20">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                Welcome to Your Learning Journey
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Access your classrooms, take tests, track your progress, and
                achieve your academic goals all in one place.
              </p>
            </div>
          </div>

          {/* Quick Stats/Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 relative z-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-500 rounded-xl p-3">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Join & Attempt
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Access classroom tests easily
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Students can join classrooms using unique codes, attempt live
                tests, and track their progress seamlessly.{" "}
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 relative z-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-emerald-500 rounded-xl p-3">
                  <Trophy size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    View & Review
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Stay on top of learning{" "}
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Students can revisit completed tests, check their answers, and
                review detailed feedback for better preparation.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 relative z-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-500 rounded-xl p-3">
                  <Target size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Improve & Achieve
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get personalized insights
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Students receive performance analytics and AI-powered
                suggestions to identify weak areas and strengthen their exam
                readiness.
              </p>
            </div>
          </div>

          {/* Classrooms Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                My Classrooms
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Your enrolled learning spaces
              </p>
            </div>

            {/* Enhanced StudentClassrooms component wrapper */}
            <div className="relative z-0">
              <StudentClassrooms />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
