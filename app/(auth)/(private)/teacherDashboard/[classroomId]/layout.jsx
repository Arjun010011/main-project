import TeacherHeader from "@/app/components/TeacherHeader";
import TeacherSidebar from "../_components/TeacherSidebar";
export default function ClassLayout({ children }) {
  return (
    <div className="flex">
      <main className="flex-1 ">
        <TeacherHeader />
        <TeacherSidebar />
        {children}
      </main>
    </div>
  );
}
