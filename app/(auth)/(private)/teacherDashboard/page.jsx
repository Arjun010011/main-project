"use client";
import EditClassroom from "@/app/components/EditClassroom";
import storeUser from "@/lib/store/userStore";
import { motion } from "framer-motion";
import TeacherHeader from "@/app/components/TeacherHeader";
import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import { supabase } from "@/utils/supabaseClient";
import ShowClassRoom from "@/app/components/ShowClassRoom";
const Page = () => {
  const [showEdit, setShowEdit] = useState(false);
  const [id, setId] = useState(null);
  const { teacherInfo, getClassRooms } = storeUser();
  const classrooms = storeUser((state) => state.classrooms);

  const sendInfo = (data) => {
    setId(data.id);
    setShowEdit(data.show);
  };
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
        <div className="flex flex-col gap-5 min-md:flex-row px-5 flex-wrap ">
          {classrooms && classrooms.length !== 0 ? (
            classrooms.map((cls) => {
              return <ShowClassRoom key={cls.id} cls={cls} onSend={sendInfo} />;
            })
          ) : (
            <div className=" w-full h-[80vh] flex items-center justify-center  text-black dark:text-white text-center">
              Create your First classroom now... <br />
              By clicking the plus icon.
            </div>
          )}
        </div>

        <div className="fixed top-0 left-0">
          {showEdit && (
            <EditClassroom onClose={() => setShowEdit(false)} id={id} />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Page;
