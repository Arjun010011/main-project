"use client";
import { FlaskConical } from "lucide-react";

function page() {
  return (
    <div className=" bg-gray-50 min-w-screen min-h-screen  flex flex-col pt-[100px] dark:bg-gray-800 min-md:pl-[270px]  px-5  items-center ">
      <div className="flex flex-col w-full h-full ">
        <p className="font-bold text-2xl pb-3 ">Create Quesiton Paper</p>
        <p className="italic font-light">
          Configure your question paper parameters and generate customized
          assements
        </p>
      </div>
      <form className="w-full h-full flex flex-col mt-15 border-1 border-bg-gray-300 p-5 max-sm:w-[90vw]">
        <p className="text-xl font-bold">
          Fill the option according to your requirement
        </p>
        <div className="">
          <p className="font-semibold  py-5">Select Subject</p>
          <div className=" flex items-center justify-between gap-5 max-sm:gap-1 w-full ">
            <div className="flex-1 gap-2 italic font-medium border-1 border-b-gray-300  px-7 py-3 max-sm:px-3 rounded-md h-auto">
              <FlaskConical />
              Chemistry
            </div>
            <div className="flex-1 gap-2 italic font-medium border-1 border-b-gray-300  px-7 py-3 max-sm:px-3 rounded-md h-auto">
              <FlaskConical />
              Chemistry
            </div>
            <div className="flex-1 gap-2 italic font-medium border-1 border-b-gray-300  px-7 py-3 max-sm:px-3 rounded-md h-auto">
              <FlaskConical />
              Chemistry
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default page;
