"use client";

import { ModeToggle } from "@/components/ui/ModeToggle";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
const Header = () => {
  const [open, setOpen] = useState(false);
  const variant = {
    hidden: { x: "150%" },
    visible: { x: "-100%" },
    exit: { x: "150%" },
  };
  return (
    <header className="flex w-[100vw] justify-between items-center px-20 max-md:px-10 overflow-x-hidden dark:bg-gray-800">
      <div className="flex gap-2 items-center justify-center flex-row-reverse max-md:mt-7 ">
        <div className="w-auto h-auto p-2">
          <ModeToggle />
        </div>
        <Image src="/logo.png" height={70} width={70} alt="logo" />
      </div>
      <div
        className={`${open ? "bg-white fixed" : "bg-transparent"} flex flex-col  right-0 top-0  p-5 h-full md:static md:flex-row dark:bg-gray-800    `}
      >
        <button
          className={`md:hidden text-black absolute right-5 `}
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X size={30} className="dark:text-white" />
          ) : (
            <Menu size={30} className="dark:text-white" />
          )}
        </button>
        <AnimatePresence>
          <motion.ul
            initial="hidden"
            animate={open ? "visible" : "hidden"}
            exit="hidden"
            variants={variant}
            transition={{ type: "tween", duration: "0.5" }}
            className={`fixed flex flex-col gap-2 py-5 pr-10  pl-7 h-[100vh]  mt-7 md:hidden dark:bg-gray-800 bg-white`}
          >
            <Link href="/">
              <li>Home</li>
            </Link>
            <li>pricing</li>
            <li>About</li>
            <li>Features</li>
            <li>FAQ</li>
            <li>Contact</li>
            <Link href="/selection">
              <li className="mt-5 md:mt-0">
                <Button variant="default">Get started</Button>
              </li>
            </Link>
          </motion.ul>
        </AnimatePresence>
        <ul className="hidden md:flex md:items-center md:gap-5">
          <Link href="/">
            <li>Home</li>
          </Link>
          <li>Pricing</li>
          <li>About</li>
          <li>Features</li>
          <li>FAQ</li>
          <li>Contact</li>
          <Link href="/selection">
            <li>
              <Button variant="default">Get started</Button>
            </li>
          </Link>
        </ul>
      </div>
    </header>
  );
};

export default Header;
