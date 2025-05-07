import { create } from "zustand";
import { persist } from "zustand/middleware";

const storeUser = create(
  persist(
    (set) => ({
      userInfo: null,
      setUserInfo: (userData) => set({ userInfo: userData }),
      clearUserInfo: () => set({ userInfo: null }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ userInfo: state.userInfo }),
    },
  ),
);

export default storeUser;
