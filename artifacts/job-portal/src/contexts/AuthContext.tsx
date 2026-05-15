import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("jp_token"),
    isLoading: true,
  });

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!state.token,
      retry: false,
    },
  });

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      setState((prev) => ({ ...prev, user, isLoading: false }));
    } else if (isError) {
      localStorage.removeItem("jp_token");
      setState({ user: null, token: null, isLoading: false });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [user, isLoading, isError]);

  const login = (token: string, user: User) => {
    localStorage.setItem("jp_token", token);
    setState({ user, token, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem("jp_token");
    setState({ user: null, token: null, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
