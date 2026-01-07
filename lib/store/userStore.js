import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

const storeUser = create(
  persist(
    (set, get) => ({
      teacherInfo: null,
      studentInfo: null,
      classrooms: [],
      studentClassrooms: [],
      studyPlans: {},

      classHeaderImage: [
        "https://i.pinimg.com/736x/a4/85/ef/a485efc275802afedf3272067396f6ac.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp584n3b80oJU--Po0b4TD6CgeS4hEYQhKlg&s",
        "https://img.freepik.com/premium-photo/purple-pink-background-with-purple-orange-color_949246-9976.jpg",
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
      getStudentClassRooms: (classRoom) =>
        set({ studentClassrooms: classRoom }),

      setStudyPlan: (classroomId, planHtml) =>
        set((state) => ({
          studyPlans: {
            ...state.studyPlans,
            [classroomId]: planHtml,
          },
        })),

      getStudyPlan: (classroomId) => get().studyPlans[classroomId] || "",

      clearStudyPlan: (classroomId) =>
        set((state) => {
          const newPlans = { ...state.studyPlans };
          delete newPlans[classroomId];
          return { studyPlans: newPlans };
        }),

      logout: async () => {
        await axios.post("/api/auth/logout");

        set({
          teacherInfo: null,
          studentInfo: null,
          classrooms: [],
          studentClassrooms: [],
          studyPlans: {},
        });

        if (typeof window !== "undefined") {
          localStorage.removeItem("user-storage");
          window.location.href = "/";
        }
      },
    }),
    {
      name: "user-storage",

      // 🔥 THIS LINE FIXES EVERYTHING
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : undefined,
      ),

      partialize: (state) => ({
        teacherInfo: state.teacherInfo,
        classrooms: state.classrooms,
        studentInfo: state.studentInfo,
        studyPlans: state.studyPlans,
      }),
    },
  ),
);

export default storeUser;

