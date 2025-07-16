import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
const storeUser = create(
  persist(
    (set, get) => ({
      teacherInfo: null,
      studentInfo: null,
      classrooms: [],
      classHeaderImage: [
        "https://i.pinimg.com/736x/a4/85/ef/a485efc275802afedf3272067396f6ac.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp584n3b80oJU--Po0b4TD6CgeS4hEYQhKlg&s",
        "https://img.freepik.com/premium-photo/purple-pink-background-with-purple-orange-color_949246-9976.jpg?semt=ais_hybrid&w=740",
        "https://img.freepik.com/premium-vector/refreshing-white-cyan-gradient-grainy-background-texture-design_901408-32531.jpg",
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
      logout: async () => {
        // Call server to clear cookies
        await axios.post("/api/auth/logout");

        // Clear Zustand state
        set({
          teacherInfo: null,
          studentInfo: null,
          classrooms: null,
        });

        // Also clear persisted storage manually
        localStorage.removeItem("user-storage");
      },
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
