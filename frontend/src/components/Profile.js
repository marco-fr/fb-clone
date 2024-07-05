import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState({});
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/profile");
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="profile">
      <h1>Profile</h1>
      <div className="profile-details">
        <img
          src="http://localhost:5000/profile/images/1"
          alt="Profile"
          className="profile-image"
        />
        <p>
          <strong>Full Name:</strong> {profile.full_name}
        </p>
        <p>
          <strong>Username:</strong> {profile.username}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
      </div>
    </div>
  );
};

export default Profile;
