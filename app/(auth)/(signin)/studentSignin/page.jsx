"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
const page = () => {
  const [user, setUser] = useState({});
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage(null);
      setErrorMsg(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, errorMsg]);

  const handleUser = (e) => {
    setUser({ ...user, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const sendUser = await axios.post("/api/auth/signinStudent", user);
      if (sendUser.status === 200) {
        setLoading(false);
        setMessage(sendUser.data.message);
        setTimeout(() => {
          router.push("/studentDashboard");
        }, 1000);
      }
    } catch (error) {
      setLoading(false);
      if (error.response) {
        setErrorMsg(error.response.data?.message || "Something went wrong");
      } else {
        setErrorMsg("something went wrong");
      }
    }
  };
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
          <p className="mt-3 text-sm">
            Don't have an account?
            <span className="font-bold">
              {" "}
              <Link href="studentSignup">Signup</Link>
            </span>
          </p>
          <div className="flex items-center justify-center my-5">
            <span className="flex-grow border-t border-slate-400"></span>
            <span className="mx-4 font-bold text-slate-400">or</span>
            <span className="flex-grow border-t border-slate-400"></span>
          </div>
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <label className="text-sm font-bold">Email</label>
            <input
              type="text"
              id="email"
              placeholder="enter your email address"
              className="border-slate-300 border p-2 rounded-lg"
              onChange={handleUser}
            />
            <label className="text-sm font-bold">Password</label>
            <input
              type="text"
              id="password"
              placeholder="enter your password"
              className="border-slate-300 border p-2 rounded-lg"
              onChange={handleUser}
              required
            />
            <div className="flex gap-2 mt-5">
              <input type="checkbox" required />
              <p className="font-extralight text-sm">
                I agree to the{" "}
                <span className="font-bold">terms of service</span> and
                <span className="font-bold"> privacy policy </span>
              </p>
            </div>
            <Button
              className={`mt-2 ${loading ? "bg-gray-500" : "bg-gray-800"} `}
            >
              {loading ? "loading..." : "Signin"}
            </Button>
            {message ? (
              <p className="px-7 py-3 bg-green-200 text-gray-600 rounded-lg">
                {message}
              </p>
            ) : (
              <p></p>
            )}
            {errorMsg ? (
              <p className="px-7 py-3 bg-red-200 text-gray-600 rounded-lg">
                {errorMsg}
              </p>
            ) : (
              <p></p>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default page;
