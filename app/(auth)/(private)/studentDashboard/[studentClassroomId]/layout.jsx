"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import axios from "axios";
import StudentHeader from "@/app/components/StudentHeader";
import StudentSidebar from "./_components/StudentSidebar";

export default function StudentClassLayout({ children }) {
  const params = useParams();
  const router = useRouter();
  const studentClassroomId = params.studentClassroomId;
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // Verify that the student has access to this classroom
        await axios.post("/api/classRoom/getClass", {
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
