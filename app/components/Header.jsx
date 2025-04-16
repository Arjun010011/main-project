"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="flex w-[100vw] justify-between items-center px-20 max-md:px-10">
      <Image src="/logo.png" height={70} width={70} alt="logo" />
      <div
        className={`${open ? "bg-white" : "bg-transparent"} flex flex-col absolute right-0 top-0  p-5 h-full md:static md:flex-row  `}
      >
        <button
          className={`md:hidden text-black `}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={30} /> : <Menu size={30} />}
        </button>
        <ul
          className={`${open ? "block" : "hidden"} flex flex-col gap-2 py-5 pr-10 pl-2 md:flex md:items-center md:flex-row md:gap-5 md:p-5`}
        >
          <li>Home</li>
          <li>pricing</li>
          <li>About</li>
          <li>Features</li>
          <li>FAQ</li>
          <li>Contact</li>
          <li className="mt-5 md:mt-0">
            <Button variant="default">Get started</Button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
