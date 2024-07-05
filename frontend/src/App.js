import Register from "./components/Register";
import Login from "./components/Login";
import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Profile from "./components/Profile";
import NewPost from "./components/NewPost";
import EditProfile from "./components/EditProfile";

const App = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  return (
    <Router>
      <Navbar />
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<EditProfile />} />
          <Route path="/new_post" element={<NewPost />} />
        </Routes>
    </Router>
  );
};

export default App;
