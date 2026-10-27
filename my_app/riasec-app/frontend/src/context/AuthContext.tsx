import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuth as useCoreAuth } from "@myriasec/core-web";
import { authApi, getAuthToken } from "../api/client";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (
    email: string,
    pass: string,
    name?: string,
    dreamWork?: string,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, status, signIn, signOut, refresh } = useCoreAuth<User>();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = useCallback(
    async (email: string, pass: string) => {
      await signIn(async () => {
        const result = await authApi.login({ email, password: pass });
        return { user: result.user, accessToken: result.accessToken };
      });
      closeAuthModal();
    },
    [signIn, closeAuthModal]
  );

  const register = useCallback(
    async (email: string,
      pass: string,
      name?: string,
      dreamWork?: string,
    ) => {
      await signIn(async () => {
        const result = await authApi.register({
          email,
          password: pass,
          name,
          dreamWork,
        });
        return { user: result.user, accessToken: result.accessToken };
      });
      closeAuthModal();
    },
    [signIn, closeAuthModal]
  );

  const refreshUser = useCallback(() => refresh(), [refresh]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    token: status === "authenticated" ? getAuthToken() : null,
    isLoading: status === "loading",
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    logout: signOut,
    refreshUser,
  }), [user, status, isAuthModalOpen, openAuthModal, closeAuthModal, login, register, signOut, refreshUser]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
