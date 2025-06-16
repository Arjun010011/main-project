"use client";
import { Button } from "@/components/ui/button";
import { FlaskConical, Calculator, AtomIcon } from "lucide-react";

function page() {
  return (
    <div className=" bg-gray-50  min-h-screen  flex flex-col pt-[100px] dark:bg-gray-800 min-lg:pl-[270px]  px-5  items-center  overflow-x-hidden">
      <div className="flex flex-col w-full h-full ">
        <p className="font-bold text-2xl pb-3 ">Create Quesiton Paper</p>
        <p className="italic font-light">
          Configure your question paper parameters and generate customized
          assemscreen
        </p>
      </div>
      <form className="w-full h-full flex flex-col mt-15 border-1 border-bg-gray-300 p-5 max-sm:w-[90vw] ">
        <p className="text-xl font-bold">
          Fill the option according to your requirement
        </p>
        <div className="">
          <p className="font-semibold  py-5">Select Subject</p>
          <div className=" flex  flex-1 justify-between gap-5 w-full max-md:flex-col ">
            <div className="flex-1 flex gap-2 italic font-medium border-1 border-b-gray-300  px-7 py-3 max-sm:px-3 rounded-md   ">
              <input type="checkbox" />
              <AtomIcon />
              Physics
            </div>
            <div className="flex-1 gap-2 italic font-medium border-1 border-b-gray-300  px-7 py-3 max-sm:px-3 rounded-md  flex">
              <input type="checkbox" />
              <FlaskConical />
              Chemistry
            </div>
            <div className="flex-1 gap-2 italic font-medium border-1 border-b-gray-300  px-7 py-3 max-sm:px-3 rounded-md  flex">
              <input type="checkbox" />
              <Calculator />
              Mathematics
            </div>
          </div>
        </div>

        {/* Physics configuration */}
        <div className="mt-15 ">
          <div className="flex gap-2 font-semibold text-md ">
            <AtomIcon />
            Physics configuration
          </div>
          <div className="flex flex-1 max-md:flex-col">
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              easy quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              medium quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              hard quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
              />
            </div>
          </div>
        </div>
        {/* Mathematics configuration */}
        <div className="mt-15 ">
          <div className="flex gap-2 font-semibold text-md">
            <Calculator />
            Mathematics configuration
          </div>
          <div className="flex flex-1 max-md:flex-col">
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              easy quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              medium quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              hard quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
              />
            </div>
          </div>
        </div>
        {/* Chemistry configuration */}
        <div className="mt-15 ">
          <div className="flex gap-2 font-semibold text-md">
            <FlaskConical />
            Chemistry configuration
          </div>
          <div className="flex flex-1 max-md:flex-col ">
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              easy quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              medium quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-2 italic font-medium">
              hard quesitons
              <input
                type="number"
                className="outline-1 outline-gray-300 rounded-md py-2 mt-3"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Button type="submit" className="mt-5">
            generate question paper
          </Button>
        </div>
      </form>
    </div>
  );
}

export default page;
