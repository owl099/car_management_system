import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("https://car-management-system-api.vercel.app/auth/login", formData);
      localStorage.setItem("token", data.token);
      navigate("/cars");
    } catch (error) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div style={{display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh"}}>
      <div className="card p-4 shadow-lg" style={{minWidth: "450px"}}>
        <h1 className="text-center mb-4">Login</h1>
        {error && <p className="alert alert-danger">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
        <p className="text-center mt-3">
          Don’t have an account?{" "}
          <span
            className="text-primary"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/signup")}
          >
            Signup here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
