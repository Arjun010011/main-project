"use client";

import storeUser from "@/lib/store/userStore";
const page = () => {
  const { userInfo } = storeUser();
  return <div>{userInfo?.fullName}</div>;
};

export default page;
