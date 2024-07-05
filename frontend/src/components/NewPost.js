import React from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthContext } from "../AuthContext";
import { useContext } from "react";
import { useState } from "react";
import axios from "axios";

const NewPost = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);
  const [fileName, setFileName] = useState("Choose an image");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  });

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content) {
      alert("Need content");
      return;
    }

    const formData = new FormData();
    formData.append("content", content);

    if (image) {
      formData.append("image", image);
    }

    try {
      await axios
        .post("/create_post", formData, { withCredentials: true })
        .then(() => {
          navigate("/");
        });
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  return (
    <div className="create-post-page">
      <h1>Create New Post</h1>
      <form onSubmit={handlePostSubmit} enctype="multipart/form-data">
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
        <textarea
          type="username"
          placeholder="Description"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default NewPost;
