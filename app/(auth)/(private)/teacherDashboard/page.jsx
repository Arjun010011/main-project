"use client";

import storeUser from "@/lib/store/userStore";
import { motion } from "framer-motion";
import TeacherHeader from "@/app/components/TeacherHeader";
import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Pen } from "lucide-react";
import EditClassroom from "@/app/components/EditClassroom";
const page = () => {
  const { teacherInfo, randomBg, getClassRooms } = storeUser();
  const classrooms = storeUser((state) => state.classrooms);
  const [showEdit, setShowEdit] = useState(false);
  console.log(classrooms);

  //used to partial reload the page whenever a classs is created or deleteted or updated

  useEffect(() => {
    fetchClassrooms();
  }, []);

  //used to fetch classroom data

  const fetchClassrooms = async () => {
    const teacherEmail = {
      email: teacherInfo.email,
    };
    const classRooms = await axios.post(
      "/api/classRoom/getClass",
      teacherEmail,
    );
    getClassRooms(classRooms.data.classRooms);
  };

  // used to delete classroom

  const deleteClassRoom = async (e) => {
    try {
      const id = e.currentTarget.dataset.key;
      const res = await axios.delete("/api/classRoom/deleteClass", {
        data: { id: id },
      });
      if (res.status === 200) {
        console.log("deleted the classroom successfully");
      }
      fetchClassrooms();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transiton={{ duration: 3 }}
      >
        <TeacherHeader />

        <p className="font-bold mx-5 ">All classrooms</p>
        <div
          className="flex flex-col max-sm:gap-5  min-md:flex-row flex-wrap  
          "
        >
          {classrooms ? (
            classrooms.map((cls) => {
              let bg = randomBg();
              return (
                <div
                  key={cls.id}
                  className={`mx-4 px-5 pb-17 pt-3 hover:scale-105 hover:shadow-2xl transition-transform duration-300 ease-in-out   rounded-md shadow-md min-w-[300px] h-[150px] flex flex-col min-md:mt-5 relative `}
                  style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: "cover",
                    backgroundColor: "black",
                  }}
                >
                  <div className="flex  justify-between flex-row-reverse">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        className="cursor-pointer"
                        data-key={cls._id}
                        onClick={deleteClassRoom}
                      >
                        <Trash2 size={20} />
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer"
                        data-key={cls._id}
                        onClick={() => setShowEdit(true)}
                      >
                        <Pen size={20} />
                      </button>
                    </div>

                    <p className="font-bold text-xl text-black ">
                      {cls.className}
                    </p>
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
      {showEdit && <EditClassroom onClose={() => setShowEdit(false)} />}
    </div>
  );
};

export default page;
