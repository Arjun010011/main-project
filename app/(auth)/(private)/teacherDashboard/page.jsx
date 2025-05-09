"use client";

import storeUser from "@/lib/store/userStore";

import { motion } from "framer-motion";
import TeacherHeader from "@/app/components/TeacherHeader";
const page = () => {
  const { userInfo } = storeUser();
  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transiton={{ duration: 3 }}
      >
        <TeacherHeader />
      </motion.div>
      {userInfo?.fullName}
    </div>
  );
};

export default page;
