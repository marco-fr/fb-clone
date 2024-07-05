import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import "./Login.css";

const EditProfile = () => {
  const [profile, setProfile] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const { isAuthenticated, userId } = useContext(AuthContext);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [fileName, setFileName] = useState('Choose a file');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/profile/" + userId);
        setProfile(response.data);
        setProfileImageUrl(
          "http://localhost:5000/profile/images/" + response.data.user_id
        );
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setFileName(file.name);
        setProfileImage(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", profile.username);
    formData.append("full_name", profile.full_name);
    formData.append("email", profile.email);

    if (profileImage) {
      formData.append("profile_image", profileImage);
    }
    console.log(profile);
    try {
      await axios.post("/edit_profile", formData, { withCredentials: true }).then(() => {
        window.location.reload()
      })
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="login-container">
      <h1>Edit Profile</h1>
      <img src={profileImageUrl} alt="Profile" className="profile-image" />
      <form onSubmit={handleFormSubmit} enctype="multipart/form-data">
        <div className="file-upload-container">
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            id="file-input"
            className="file-input"
            onChange={handleFileChange}
          />
          <label htmlFor="file-input" className="file-label">
            {fileName}
          </label>
        </div>
        Username
        <input
          type="username"
          placeholder="Username"
          value={profile.username}
          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          required
        />
        Name 
        <input
          type="username"
          placeholder="Name"
          value={profile.full_name}
          onChange={(e) =>
            setProfile({ ...profile, full_name: e.target.value })
          }
          required
        />
        Email
        <input
          type="email"
          placeholder="Email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          required
        />
        <button type="submit">Submit Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;
