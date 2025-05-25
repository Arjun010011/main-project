"use client";

import StudentHeader from "@/app/components/StudentHeader";
import StudentClassrooms from "@/app/components/StudentClassrooms";

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <main className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6 px-4">My Classrooms</h1>
        <StudentClassrooms />
      </main>
    </div>
  );
};

export default StudentDashboard;
