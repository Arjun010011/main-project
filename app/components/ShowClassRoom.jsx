import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Trash2, Pen } from "lucide-react";
import EditClassroom from "@/app/components/EditClassroom";
const showClassRoom = ({ cls }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [id, setId] = useState("");
  const [studentCount, setStudentCount] = useState(null);
  const [loading, setLoading] = useState(false);
  //delete classroom
  const deleteClassRoom = async (e) => {
    try {
      const id = e.currentTarget.dataset.key;
      const res = await axios.delete("/api/classRoom/deleteClass", {
        data: { id },
      });
      if (res.status === 200) {
        console.log("Deleted classroom successfully");
      }
    } catch (error) {
      console.error("Error deleting classroom:", error);
    }
  };
  useEffect(() => {
    const classroomId = cls.id;
    const req = { classroomId: classroomId };
    console.log(classroomId);
    const fetchStudents = async () => {
      try {
        const response = await axios.post(
          "/api/classRoom/getClassroomStudents",
          req,
        );
        setStudentCount(response.data.students.length);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    if (classroomId) {
      fetchStudents();
    }
  }, [cls.id]);

  return (
    <div className="flex w-fit mt-5 h-fit max-md:justify-center ">
      <div
        key={cls.id}
        className=" px-5 pb-17 pt-3 hover:scale-105 hover:shadow-2xl transition-transform duration-300 ease-in-out rounded-md shadow-md min-w-[400px] h-[150px] flex flex-col min-md:mt-5 relative"
        style={{
          backgroundImage: `url(${cls.image})`,
          backgroundSize: "cover",
          backgroundColor: "black",
        }}
      >
        <div className="flex justify-between flex-row-reverse">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="cursor-pointer"
              data-key={cls.id}
              onClick={deleteClassRoom}
            >
              <Trash2 size={20} className="dark:text-gray-900" />
            </button>
            <button
              type="button"
              className="cursor-pointer"
              data-key={cls.id}
              onClick={() => {
                setShowEdit(true);
                setId(cls.id);
              }}
            >
              <Pen size={20} className="dark:text-gray-900" />
            </button>
          </div>

          <Link href={`/teacherDashboard/${cls.id}`} key={cls.id}>
            <p className="font-bold text-xl text-black">{cls.className}</p>
          </Link>
        </div>
        <p className="dark:text-black">Number of students:{studentCount}</p>
      </div>
      <div className="fixed top-0 left-0">
        {showEdit && (
          <EditClassroom onClose={() => setShowEdit(false)} id={id} />
        )}
      </div>
    </div>
  );
};

export default showClassRoom;
