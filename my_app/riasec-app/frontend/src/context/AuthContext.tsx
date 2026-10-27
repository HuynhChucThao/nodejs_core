import React, { createContext, useContext, useState } from "react";
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
  const coreAuth = useCoreAuth<User>();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (email: string, pass: string) => {
    await coreAuth.signIn(async () => {
      const result = await authApi.login({ email, password: pass });
      return { user: result.user, accessToken: result.accessToken };
    });
    closeAuthModal();
  };

  const register = async (
    email: string,
    pass: string,
    name?: string,
    dreamWork?: string,
  ) => {
    await coreAuth.signIn(async () => {
      const result = await authApi.register({
        email,
        password: pass,
        name,
        dreamWork,
      });
      return { user: result.user, accessToken: result.accessToken };
    });
    closeAuthModal();
  };

  const logout = () => {
    coreAuth.signOut();
  };

  const refreshUser = async () => {
    await coreAuth.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user: coreAuth.user,
        token: getAuthToken(),
        isLoading: coreAuth.status === "loading",
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
