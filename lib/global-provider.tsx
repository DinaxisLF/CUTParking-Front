import React, { createContext, useContext, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentUser, logout } from "./appwrite";
import { useAppwrite } from "./useAppwrite";
import { useEffect, useState } from "react";

interface GlobalContextType {
  isLogged: boolean;
  user: User | null;
  loading: boolean;
  refetch: () => void;
}

interface User {
  $id: string;
  name: string;
  email: string;
  avatar: string;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  const {
    data: user,
    loading,
    refetch,
  } = useAppwrite({
    fn: getCurrentUser,
  });

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem("jwtToken");
      setJwtToken(token);
    };
    loadToken();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("jwtToken");
    setJwtToken(null);
    await logout();
  };

  const isLogged = !!user && !!jwtToken;

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        user,
        loading,
        refetch,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider");

  return context;
};

export default GlobalProvider;
