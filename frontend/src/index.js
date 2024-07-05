import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css"
import axios from "axios";

import { AuthContext, AuthProvider } from "./AuthContext";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:5000";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider classname="body">
      <App/>
    </AuthProvider>
  </React.StrictMode>
);
