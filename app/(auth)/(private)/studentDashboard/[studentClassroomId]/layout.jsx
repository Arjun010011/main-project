"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { Loader } from "lucide-react";
import axios from "axios";
import StudentHeader from "@/app/components/StudentHeader";
import StudentSidebar from "./_components/StudentSidebar";

export default function StudentClassLayout({ children }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const studentClassroomId = params.studentClassroomId;
  const [isAuthorized, setIsAuthorized] = useState(null);

  // Check if current page is a test interface
  const isTestPage =
    pathname?.includes("/test/") ||
    pathname?.includes("/testInterface") ||
    pathname?.endsWith("/test") ||
    params.testId; // If there's a testId param, it's likely a test page

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // Verify that the student has access to this classroom
        await axios.post("/api/classRoom/getClassStudent", {
          id: studentClassroomId,
        });
        setIsAuthorized(true);
      } catch (error) {
        console.error("Access denied:", error);
        setIsAuthorized(false);
        // Redirect to student dashboard if access is denied
        router.push("/studentDashboard");
      }
    };
    if (studentClassroomId) {
      verifyAccess();
    }
  }, [studentClassroomId, router]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (isAuthorized === false) {
    return null; // Will redirect to dashboard
  }

  // If it's a test page, render without header and sidebar
  if (isTestPage) {
    return <div className="w-full h-screen">{children}</div>;
  }

  // Normal layout with header and sidebar
  return (
    <div className="flex">
      <main className="flex-1">
        <StudentHeader />
        <StudentSidebar />
        {children}
      </main>
    </div>
  );
}
