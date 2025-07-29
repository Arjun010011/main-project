"use client";
import { GraduationCap } from "lucide-react";
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
  }, [teacherInfo?.email, getClassRooms]);

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    if (!teacherInfo?.email) {
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
  }, [classrooms, teacherInfo.email]);

  return (
    <div className="dark:bg-gray-800 h-[100vh] pt-[100px]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        className="dark:bg-gray-800 "
      >
        <TeacherHeader />
        <div className="min-md:ml-12 ml-2">
          <p className="font-bold text-2xl min-md:mx-20 mx-5">Dashboard</p>
          <p className="min-md:mx-20 my-2 italic text-light mx-5">
            Manage your classrooms
          </p>
        </div>
        <div className=" h-full flex items-center justify-center min-md:gap-44 gap-2 text-sm mt-5 text-black  w-full px-5   ">
          <div className="shadow-sm  px-4 py-3 flex  rounded-md  items-center justify-between text-xl bg-gradient-to-r from-blue-100 to-blue-300 w-full max-w-[280px] ">
            <div className="flex flex-col">
              <p className="whitespace-nowrap max-sm:text-sm">total classes</p>
              <p className=" font-bold pl-10 pt-3 text-xl max-sm:text-lg">
                {classrooms.length}
              </p>
            </div>
            <GraduationCap className="text-sm" />
          </div>

          <div className="shadow-sm  px-4 py-3 flex  rounded-md  items-center justify-between text-xl bg-gradient-to-r from-blue-100 to-blue-300 w-full max-w-[280px] ">
            <div className="flex flex-col">
              <p className="whitespace-nowrap max-sm:text-sm">total Students</p>
              <p className=" font-bold pl-10 pt-3 text-xl max-sm:text-lg">
                {classrooms.length}
              </p>
            </div>
            <GraduationCap className="text-sm" />
          </div>

          <div className="shadow-sm  px-4 py-3 flex  rounded-md  items-center justify-between text-xl bg-gradient-to-r from-blue-100 to-blue-300 w-full max-w-[280px] max-sm:hidden ">
            <div className="flex flex-col">
              <p className="whitespace-nowrap">papers created</p>
              <p className="font-bold pl-10 pt-3 text-xl">
                {classrooms.length}
              </p>
            </div>
            <GraduationCap size={35} />
          </div>

          <div className="shadow-sm  px-4 py-3 flex  rounded-md  items-center justify-between text-xl bg-gradient-to-r from-blue-100 to-blue-300 w-full max-w-[280px] max-sm:hidden ">
            <div className="flex flex-col">
              <p className="whitespace-nowrap">Test conducted</p>
              <p className=" font-bold pl-10 pt-3 text-xl">
                {classrooms.length}
              </p>
            </div>
            <GraduationCap size={35} />
          </div>
        </div>
        <div className="flex flex-col gap-5 min-md:flex-row  flex-wrap w-full items-center justify-center overflow-hidden ">
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
