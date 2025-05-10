import { create } from "zustand";
import { persist } from "zustand/middleware";

const storeUser = create(
  persist(
    (set) => ({
      userInfo: null,
      subject: [],
      setUserInfo: (userData) => set({ userInfo: userData }),
      clearUserInfo: () => set({ userInfo: null }),
      setSubject: (theSubject) => set({ subject: theSubject }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ userInfo: state.userInfo }),
    }
  )
);

export default storeUser;
