"use client";

import storeUser from "@/lib/store/userStore";
import { motion } from "framer-motion";
import TeacherHeader from "@/app/components/TeacherHeader";
const page = () => {
  const { userInfo } = storeUser();
  const classrooms = storeUser((state) => state.classrooms);
  console.log(classrooms);
  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transiton={{ duration: 3 }}
      >
        <TeacherHeader />
        {classrooms.map((cls) => (
          <div key={cls._id} className="bg-black text-white">
            {cls.className}
          </div>
        ))}
      </motion.div>
      {userInfo?.fullName}
    </div>
  );
};

export default page;
