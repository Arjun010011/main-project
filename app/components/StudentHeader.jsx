"use client";
import Image from "next/image";
import storeUser from "@/lib/store/userStore";
import { Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import JoinClassroom from "./JoinClassroom";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { AvatarImage, Avatar } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
const StudentHeader = () => {
  const studentInfo = storeUser((state) => state.studentInfo);
  const [showJoinClassroom, setShowJoinClassroom] = useState(false);

  const logout = storeUser((state) => state.logout);
  const handleLogout = async () => {
    logout();
    router.push("/");
  };
  return (
    <div className="w-screen flex-1 flex h-[100px] fixed top-0 items-center justify-center flex-col">
      <header className="flex p-5 w-full items-center flex-row-reverse">
        <div className="flex items-center gap-8">
          <div
            className="p-2 rounded-full hover:bg-gray-100 hover:cursor-pointer transition duration-300 ease-in-out"
            onClick={() => setShowJoinClassroom(true)}
          >
            <Plus size={20} />
          </div>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage
                  src={studentInfo?.image || "/logo.png"}
                  width={40}
                  height={40}
                  className="rounded-full cursor-pointer"
                />
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-5">
              <DropdownMenuLabel>
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Delete account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/studentDashboard">
                <DropdownMenuLabel>Go to home</DropdownMenuLabel>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {showJoinClassroom && (
        <JoinClassroom onClose={() => setShowJoinClassroom(false)} />
      )}
    </div>
  );
};

export default StudentHeader;
