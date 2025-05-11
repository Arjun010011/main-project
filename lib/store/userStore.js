import { create } from "zustand";
import { persist } from "zustand/middleware";

const storeUser = create(
  persist(
    (set) => ({
      teacherInfo: null,
      studentInfo: null,
      classrooms: [],
      errorMsg: "",
      successMsg: "",
      loading: false,
      setTeacherInfo: (userData) => set({ teacherInfo: userData }),
      setErrorMsg: (msg) => set({ errorMsg: msg }),
      setSuccessMsg: (msg) => set({ successMsg: msg }),
      clearTeacherInfo: () => set({ teacherInfo: null }),
      setStudentInfo: (student) => set({ studentInfo: student }),
      clearStudentInfo: () => set({ studentInfo: null }),
      setLoading: (load) => set({ loading: load }),
      insertClassrooms: (classroom) =>
        set((state) => ({
          classrooms: [...state.classrooms, classroom],
        })),
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
