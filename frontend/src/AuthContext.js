import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get("/check-auth");
      setIsAuthenticated(response.data.isAuthenticated);
      setUserId(response.data.user_id)
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const login = async (email, password) => {
    const headers = {
      "Content-Type": "application/json",
      "With-Credentials": "true"
    };
    await axios
      .post("/login", { email, password }, headers)
      .then(function (response) {
        setIsAuthenticated(true);
        setUserId(response.data.user_id)
        alert(response.data.message);
      })
      .catch(function (error) {
        if (error.response) {
          alert(error.response.data.error);
        } else {
          alert("Unexpected error occurred");
        }
      });
  };

  const logout = async () => {
    try {
      await axios.post("/logout");
      setIsAuthenticated(false);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
