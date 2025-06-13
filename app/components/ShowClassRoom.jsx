import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Trash2, Pen } from "lucide-react";
const showClassRoom = ({ cls, onSend }) => {
  const [studentCount, setStudentCount] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendData = () => {
    onSend({ id: cls.id, show: true });
  };
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
        className=" px-5 pb-17 pt-3 hover:scale-105 hover:shadow-2xl transition-transform duration-300 ease-in-out rounded-md shadow-md min-w-[430px] h-[150px] flex flex-col min-md:mt-5 relative"
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
            <button type="button" className="cursor-pointer">
              <Pen
                size={20}
                className="dark:text-gray-900"
                onClick={() => sendData()}
              />
            </button>
          </div>

          <Link href={`/teacherDashboard/${cls.id}`} key={cls.id}>
            <p className="font-bold text-xl text-black">{cls.className}</p>
          </Link>
        </div>
        <p className="dark:text-black">Number of students:{studentCount}</p>
      </div>
    </div>
  );
};

export default showClassRoom;
