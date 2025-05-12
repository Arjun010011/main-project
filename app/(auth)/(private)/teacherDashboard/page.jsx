"use client";

import storeUser from "@/lib/store/userStore";
import { motion } from "framer-motion";
import TeacherHeader from "@/app/components/TeacherHeader";
const page = () => {
  const { userInfo, randomBg } = storeUser();
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
        <div className="flex flex-col gap-4 min-md:flex-row">
          <p className="font-bold mx-5 ">All classrooms</p>
          {classrooms ? (
            classrooms.map((cls) => {
              let bg = randomBg();
              return (
                <div
                  key={cls._id}
                  className={`mx-5 px-5 pb-17 pt-3  rounded-md shadow-md min-md:w-[400px] flex flex-col`}
                  style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: "cover",
                    backgroundColor: "black",
                  }}
                >
                  <p className="font-bold text-xl text-black ">
                    {cls.className}
                  </p>
                  total student 0
                </div>
              );
            })
          ) : (
            <div>Create your First classroom now...</div>
          )}
        </div>
      </motion.div>
      {userInfo?.fullName}
    </div>
  );
};

export default page;
