import React, { useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { useContext } from "react";
import "./Home.css";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("/posts");
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      alert("Please log in to like posts.");
      return;
    }

    try {
      await axios
        .post(`/posts/${postId}/like`, {}, { withCredentials: true })
        .then((response) => {
          setPosts(
            posts.map((post) =>
              post.id === postId
                ? { ...post, likes: post.likes + response.data["change"] }
                : post
            )
          );
          console.log(response);
        });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId, content) => {
    if (!isAuthenticated) {
      alert("Please log in to comment on posts.");
      return;
    }

    try {
      await axios.post(
        `/posts/${postId}/comment`,
        { content },
        { withCredentials: true }
      );
      const response = await axios.get(`/posts/${postId}/comments`);
      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, comments: response.data } : post
        )
      );
    } catch (error) {
      console.error("Error commenting on post:", error);
    }
  };

  return (
    <div className="home">
      {posts.map((post) => (
        <div key={post.id} className="post">
          <div className="post-bar">
            <div className="post-author">
              <img
                src={"http://localhost:5000/profile/images/" + post.user_id}
                className="post_profile_img"
              />
              <h3>{post.full_name}</h3>
            </div>
            <p>Date: {new Date(post.timestamp).toUTCString()}</p>
          </div>
          <p>{post.content}</p>
          {post.image ? (
            <img
              src={"http://localhost:5000/post/images/" + post.id}
              className="img"
            />
          ) : (
            <></>
          )}
          <div>
            <button className="like-button" onClick={() => handleLike(post.id)}>
              Like ({post.likes || 0})
            </button>
          </div>
          <div className="comments">
            {post.comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="post-bar">
                  <div className="post-author">
                    <img
                      src={
                        "http://localhost:5000/profile/images/" + comment.user_id
                      }
                      className="post_profile_img"
                    />
                    <h3>{comment.full_name}</h3>
                  </div>
                  <p>Date: {new Date(comment.timestamp).toLocaleDateString()}</p>
                </div>
                <p>{comment.content}</p>
              </div>
            ))}
            <form
              className="comment-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleComment(post.id, e.target.elements.content.value);
                e.target.reset();
              }}
            >
              <input
                type="text"
                name="content"
                placeholder="Add a comment"
                required
              />
              <button type="submit">Comment</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
