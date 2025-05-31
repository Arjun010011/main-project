"use client";

import storeUser from "@/lib/store/userStore";
import { motion } from "framer-motion";
import TeacherHeader from "@/app/components/TeacherHeader";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Trash2, Pen } from "lucide-react";
import EditClassroom from "@/app/components/EditClassroom";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
const Page = () => {
  const { teacherInfo, getClassRooms } = storeUser();
  const classrooms = storeUser((state) => state.classrooms);
  const [showEdit, setShowEdit] = useState(false);
  const [id, setId] = useState(null);
  // Fetch classrooms
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
  }, [teacherInfo.email, getClassRooms]);

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    if (!teacherInfo.email) {
      console.log("No teacher email, skipping subscription");
      return;
    }

    // Fetch initial classrooms
    fetchClassrooms();

    // Subscribe to real-time changes on the classroom table
    const channel = supabase
      .channel("classroom-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classroom" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Check if the new classroom belongs to the teacher
            if (payload.new.teacher_email === teacherInfo.email) {
              getClassRooms([...classrooms, payload.new]);
            }
          } else if (payload.eventType === "UPDATE") {
            fetchClassrooms(); // Refetch to ensure consistency
          } else if (payload.eventType === "DELETE") {
            getClassRooms(
              classrooms.filter((cls) => cls.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [teacherInfo.email, fetchClassrooms, classrooms, getClassRooms]);

  // Delete classroom
  const deleteClassRoom = async (e) => {
    try {
      const id = e.currentTarget.dataset.key;
      const res = await axios.delete("/api/classRoom/deleteClass", {
        data: { id },
      });
      if (res.status === 200) {
        console.log("Deleted classroom successfully");
      }
    } catch (error) {
      console.error("Error deleting classroom:", error);
    }
  };

  return (
    <div className="dark:bg-gray-800 h-[100vh]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        className="dark:bg-gray-800"
      >
        <TeacherHeader />
        <p className="font-bold mx-5">All classrooms</p>
        <div className="flex flex-col max-sm:gap-5 min-md:flex-row flex-wrap">
          {classrooms ? (
            classrooms.map((cls) => {
              let bg = cls.image;
              return (
                <div
                  key={cls.id}
                  className="mx-4 px-5 pb-17 pt-3 hover:scale-105 hover:shadow-2xl transition-transform duration-300 ease-in-out rounded-md shadow-md min-w-[300px] h-[150px] flex flex-col min-md:mt-5 relative"
                  style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: "cover",
                    backgroundColor: "black",
                  }}
                >
                  <div className="flex justify-between flex-row-reverse">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        className="cursor-pointer"
                        data-key={cls.id}
                        onClick={deleteClassRoom}
                      >
                        <Trash2 size={20} />
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer"
                        data-key={cls.id}
                        onClick={() => {
                          setShowEdit(true);
                          setId(cls.id);
                        }}
                      >
                        <Pen size={20} />
                      </button>
                    </div>

                    <Link href={`/teacherDashboard/${cls.id}`} key={cls.id}>
                      <p className="font-bold text-xl text-black">
                        {cls.className}
                      </p>
                    </Link>
                  </div>
                  total student 0
                </div>
              );
            })
          ) : (
            <div className="text-black">Create your First classroom now...</div>
          )}
        </div>
      </motion.div>
      {teacherInfo?.fullName}
      {showEdit && <EditClassroom onClose={() => setShowEdit(false)} id={id} />}
    </div>
  );
};

export default Page;
