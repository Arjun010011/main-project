import StudentHeader from "@/app/components/StudentHeader";
import StudentSidebar from "./_components/StudentSidebar";

export default function StudentClassLayout({ children }) {
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
