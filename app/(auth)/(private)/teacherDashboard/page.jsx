"use client";
import { GraduationCap, BookOpen, Users, Zap } from "lucide-react";
import EditClassroom from "@/app/components/EditClassroom";
import storeUser from "@/lib/store/userStore";
import { motion } from "framer-motion";
import TeacherHeader from "@/app/components/TeacherHeader";
import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import ShowClassRoom from "@/app/components/ShowClassRoom";
const Page = () => {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [id, setId] = useState(null);
  const { teacherInfo, getClassRooms } = storeUser();
  const classrooms = storeUser((state) => state.classrooms);

  useEffect(() => {
    if (teacherInfo === null) {
      router.push("/");
    }
  }, [teacherInfo, router]);

  const sendInfo = (data) => {
    setId(data.id);
    setShowEdit(data.show);
  };

  const fetchClassrooms = useCallback(async () => {
    try {
      const teacherEmail = { email: teacherInfo.email };
      const { data } = await axios.post(
        "/api/classRoom/getAllClass",
        teacherEmail,
      );
      getClassRooms(data.classRooms);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  }, [teacherInfo?.email, getClassRooms]);

  useEffect(() => {
    if (!teacherInfo?.email) {
      console.log("No teacher email, skipping subscription");
      return;
    }

    fetchClassrooms();

    const channel = supabase
      .channel("classroom-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classroom" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            if (payload.new.teacher_email === teacherInfo.email) {
              getClassRooms([...classrooms, payload.new]);
            }
          } else if (payload.eventType === "UPDATE") {
            fetchClassrooms();
          } else if (payload.eventType === "DELETE") {
            getClassRooms(
              classrooms.filter((cls) => cls.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classrooms, teacherInfo?.email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <TeacherHeader />
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
              Welcome to Your Teaching Hub
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Manage your classrooms, engage with students, and create amazing
              learning experiences all in one place.
            </p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-500 rounded-xl p-3">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Create & Organize
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Build diverse test content
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Design structured practice tests, that challenge students and
              improve their performance.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-500 rounded-xl p-3">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Connect & Engage
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Simplify the evaluation process{" "}
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Allow students to take structured tests with ease while enabling
              educators to review performance and provide clear results.{" "}
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-500 rounded-xl p-3">
                <Zap size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Track & Improve
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Gain valuable insights
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Monitor student performance through detailed result analytics,
              helping educators identify strengths and areas for
              improvement.{" "}
            </p>
          </div>
        </div>

        {/* Classrooms Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Your Classrooms
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and organize your teaching spaces
            </p>
          </div>

          {classrooms && classrooms.length !== 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((cls) => (
                <ShowClassRoom key={cls.id} cls={cls} onSend={sendInfo} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Ready to Start Teaching?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Create your first classroom and begin building amazing
                  learning experiences for your students.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                  <span>Click the + icon to get started</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50">
          <EditClassroom onClose={() => setShowEdit(false)} id={id} />
        </div>
      )}
    </div>
  );
};

export default Page;
