import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LOGIN_CONFIG } from "@/lib/auth-config";

interface AuthState {
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (username, password) => {
        if (username === LOGIN_CONFIG.username && password === LOGIN_CONFIG.password) {
          set({ isAuthenticated: true });
          return { success: true };
        }
        return { success: false, message: "Usuário ou senha incorretos." };
      },
      logout: () => {
        set({ isAuthenticated: false });
      },
    }),
    {
      name: LOGIN_CONFIG.sessionKey,
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
