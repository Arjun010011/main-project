"use client";

import storeUser from "@/lib/store/userStore";
import TeacherHeader from "@/app/components/TeacherHeader";
const page = () => {
  const { userInfo } = storeUser();
  return (
    <div>
      <TeacherHeader />
      {userInfo?.fullName}
    </div>
  );
};

export default page;
