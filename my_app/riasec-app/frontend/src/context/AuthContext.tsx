import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi, getAuthToken, setAuthToken } from "../api/client";
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const refreshUser = async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch {
      // Token expired or invalid
      setAuthToken(null);
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const result = await authApi.login({ email, password: pass });
    setAuthToken(result.accessToken); // sửa: result.token -> result.accessToken
    setTokenState(result.accessToken); // sửa: result.token -> result.accessToken
    setUser(result.user);
    closeAuthModal();
  };

  const register = async (
    email: string,
    pass: string,
    name?: string,
    dreamWork?: string,
  ) => {
    const result = await authApi.register({
      email,
      password: pass,
      name,
      dreamWork,
    });
    setAuthToken(result.accessToken); // sửa: result.token -> result.accessToken
    setTokenState(result.accessToken); // sửa: result.token -> result.accessToken
    setUser(result.user);
    closeAuthModal();
  };

  const logout = () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
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
