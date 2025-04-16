"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
const Header = () => {
  const [open, setOpen] = useState(false);
  const variant = {
    hidden: { x: "150%" },
    visible: { x: 0 },
    exit: { x: "150%" },
  };
  return (
    <header className="flex w-[100vw] justify-between items-center px-20 max-md:px-10 overflow-x-hidden">
      <Image src="/logo.png" height={70} width={70} alt="logo" />
      <div
        className={`${open ? "bg-white" : "bg-transparent"} flex flex-col absolute right-0 top-0  p-5 h-full md:static md:flex-row  `}
      >
        <button
          className={`md:hidden text-black absolute right-5 `}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={30} /> : <Menu size={30} />}
        </button>
        <motion.ul
          initial="hidden"
          animate={open ? "visible" : "hidden"}
          exit="hidden"
          variants={variant}
          transition={{ type: "tween", duration: "0.5" }}
          className={`${open ? "block" : "hidden"} flex flex-col gap-2 py-5 pr-10 pl-2 mt-7 md:hidden`}
        >
          <Link href="/">
            <li>Home</li>
          </Link>
          <li>pricing</li>
          <li>About</li>
          <li>Features</li>
          <li>FAQ</li>
          <li>Contact</li>
          <li className="mt-5 md:mt-0">
            <Button variant="default">Get started</Button>
          </li>
        </motion.ul>
        <ul className="hidden md:flex md:items-center md:gap-5">
          <Link href="/">
            <li>Home</li>
          </Link>
          <li>Pricing</li>
          <li>About</li>
          <li>Features</li>
          <li>FAQ</li>
          <li>Contact</li>
          <li>
            <Button variant="default">Get started</Button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
