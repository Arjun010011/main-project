"use client";
import Image from "next/image";
import storeUser from "@/lib/store/userStore";
const TeacherHeader = () => {
  const { userInfo } = storeUser();
  console.log(userInfo);
  return (
    <div>
      <header>
        <Image
          src={userInfo.image || "/logo.png"}
          height={70}
          width={70}
          alt="logo"
          className="rounded-full"
        />
      </header>
    </div>
  );
};

export default TeacherHeader;
