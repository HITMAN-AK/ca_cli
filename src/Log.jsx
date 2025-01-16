import React, { useState } from "react";
import axios from "axios";
import "./css/log.css";
import { useNavigate } from "react-router-dom";

function Log() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [es, setEs] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}log/`,
        {
          uname: username,
          pas: password,
        }
      );
      if (response.data.status) {
        sessionStorage.setItem("uname", username);
        navigate("/main");
        setEs(false);
      } else {
        setErrorMessage("Invalid username or password");
        setEs(true);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Invalid username or password");
      } else {
        setErrorMessage("An error occurred. Please try again later.");
      }
      setEs(true);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-box">
        <h2 className="login-form-header">Login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <input
              id="username-input"
              className="login-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading} // Disable input when loading
            />
          </div>
          <div className="login-input-group">
            <input
              id="password-input"
              className="login-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading} // Disable input when loading
            />
          </div>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <button
              id="submit-button"
              className="login-submit-button"
              type="submit"
            >
              LOG-IN
            </button>
          )}
        </form>
        {es && <p className="error-message">{errorMessage}</p>}
        <p className="signup-link">
          Don't have an account? <a href="/sign-up">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default Log;
