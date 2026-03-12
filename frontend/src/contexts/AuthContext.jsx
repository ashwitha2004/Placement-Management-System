import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (saved) {
      const userData = JSON.parse(saved);
      // Ensure compatibility
      return {
        ...userData,
        id: userData.id || userData._id,
        _id: userData._id || userData.id
      };
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  });

  const login = (userData, authToken, options = {}) => {
    const rememberMe = options?.rememberMe !== false;
    // Ensure user has both id and _id for compatibility
    const normalizedUser = {
      ...userData,
      id: userData.id || userData._id,
      _id: userData._id || userData.id
    };
    setUser(normalizedUser);
    setToken(authToken);
    if (rememberMe) {
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("token", authToken);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    } else {
      sessionStorage.setItem("user", JSON.stringify(normalizedUser));
      sessionStorage.setItem("token", authToken);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    return normalizedUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
