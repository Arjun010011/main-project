"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
const page = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full h-[100vh] flex items-center justify-center shadow-md "
    >
      <div className="flex flex-col items-center justify-center p-7  border border-slate-800 mx-5  rounded-lg md:flex-row gap-2 md:p-0">
        <div className="hidden md:block">
          <Image
            src="/signup.png"
            width={450}
            height={450}
            alt="student image"
            className="rounded-lg"
          />
        </div>
        <div className="h-auto w-auto  md:p-10">
          <Button className="w-[300px]" variant="outline">
            Signup with Google
          </Button>
          <p className="mt-3 text-sm">
            Already have an account?<span className="font-bold"> Signin</span>
          </p>
          <div className="flex items-center justify-center my-5">
            <span className="flex-grow border-t border-slate-400"></span>
            <span className="mx-4 font-bold text-slate-400">or</span>
            <span className="flex-grow border-t border-slate-400"></span>
          </div>
          <form className="flex flex-col gap-2">
            <label className="text-sm font-bold"> full name</label>
            <input
              type="text"
              placeholder="enter your full name"
              className="border-slate-300 border p-2 rounded-lg"
            />
            <label className="text-sm font-bold">Email</label>
            <input
              type="text"
              placeholder="enter your email address"
              className="border-slate-300 border p-2 rounded-lg"
            />
            <label className="text-sm font-bold">Password</label>
            <input
              type="text"
              placeholder="enter your password"
              className="border-slate-300 border p-2 rounded-lg"
            />
            <div className="flex gap-2 mt-5">
              <input type="checkbox" />
              <p className="font-extralight text-sm">
                I agree to the{" "}
                <span className="font-bold">terms of service</span> and
                <span className="font-bold"> privacy policy </span>
              </p>
            </div>
            <Button className="mt-2">Signup</Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default page;
