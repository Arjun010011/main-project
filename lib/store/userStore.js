import { create } from "zustand";
import { persist } from "zustand/middleware";

const storeUser = create(
  persist(
    (set) => ({
      teacherInfo: null,
      studentInfo: null,
      classrooms: [],
      setTeacherInfo: (userData) => set({ teacherInfo: userData }),
      clearTeacherInfo: () => set({ teacherInfo: null }),
      setStudentInfo: (student) => set({ studentInfo: student }),
      clearStudentInfo: () => set({ studentInfo: null }),
      insertClassrooms: (classroom) =>
        set((state) => {
          const newClassRoom = [...state.classrooms];
          newClassRoom.push(classroom);
          return { classrooms: newClassRoom };
        }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        teacherInfo: state.teacherInfo,
        classrooms: state.classrooms,
      }),
    }
  )
);

export default storeUser;
