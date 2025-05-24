import { create } from "zustand";
import { persist } from "zustand/middleware";

const storeUser = create(
  persist(
    (set, get) => ({
      teacherInfo: null,
      studentInfo: null,
      classrooms: [],
      classHeaderImage: [
        "https://i.pinimg.com/736x/2d/23/38/2d2338bd97ce7eb7f76dd1f2b9e8b515.jpg",
        "https://slidechef.net/wp-content/uploads/2021/11/Anime-Classroom-Background.jpg",
        "https://i.pinimg.com/736x/62/7f/00/627f00bb8a8afc12de394937bd36fe31.jpg",
        "https://image.slidesdocs.com/responsive-images/background/leaves-yellow-linear-nature-plant-cute-powerpoint-background_5dd5de7411__960_540.jpg",
        "https://image.slidesdocs.com/responsive-images/background/tradition-new-year-festival-beautiful-korea-yellow-powerpoint-background_6068c855df__960_540.jpg",
      ],
      randomBg: () =>
        get().classHeaderImage[
          Math.floor(Math.random() * get().classHeaderImage.length)
        ],
      setTeacherInfo: (userData) => set({ teacherInfo: userData }),
      clearTeacherInfo: () => set({ teacherInfo: null }),
      setStudentInfo: (student) => set({ studentInfo: student }),
      clearStudentInfo: () => set({ studentInfo: null }),
      getClassRooms: (classRoom) => set({ classrooms: classRoom }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        teacherInfo: state.teacherInfo,
        classrooms: state.classrooms,
        studentInfo: state.studentInfo,
      }),
    },
  ),
);

export default storeUser;
