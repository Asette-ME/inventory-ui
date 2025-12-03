"use client";

import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

import { api } from "@/lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  image?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser(decoded.user);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (data: any) => {
    try {
      // Use the rewrite path
      const res = await api.post("/auth/token/login", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Login failed");
      }
      const { data: tokenData } = await res.json();
      handleToken(tokenData.access_token);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (data: any) => {
    try {
      const res = await api.post("/auth/token/signup", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Signup failed");
      }
      const { data: tokenData } = await res.json();
      handleToken(tokenData.access_token);
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = () => {
    // Open popup to the rewrite path
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      "/api/auth/google",
      "google_login",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const pollTimer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(pollTimer);
        return;
      }

      try {
        // Check if popup has redirected back to our callback URL
        if (popup.location.href.includes("/api/auth/google/callback")) {
          // The backend returns the JSON response directly in the body
          // But we can't read the body of the document easily if it's just JSON text displayed in browser
          // Wait... if the backend returns JSON, the browser displays it.
          // We can read `popup.document.body.innerText`

          const responseText = popup.document.body.innerText;
          try {
            const response = JSON.parse(responseText);
            if (response.data && response.data.access_token) {
              handleToken(response.data.access_token);
              popup.close();
              clearInterval(pollTimer);
            }
          } catch (e) {
            // Not JSON yet or parsing error
          }
        }
      } catch (e) {
        // Cross-origin error (expected while on Google's domain)
      }
    }, 500);
  };

  const handleToken = (token: string) => {
    localStorage.setItem("token", token);
    const decoded: any = jwtDecode(token);
    setUser(decoded.user);

    // Check for redirect parameter in URL
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    router.push(redirect || "/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
    >
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
