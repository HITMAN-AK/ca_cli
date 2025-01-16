import React, { useState } from "react";
import axios from "axios";
import "./css/sign.css";
import { useNavigate } from "react-router-dom";

function Sign() {
  const [formData, setFormData] = useState({ name: "", uname: "", pas: "" });
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false); 
  const [signUpLoading, setSignUpLoading] = useState(false); 
  const navigate =useNavigate()
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const checkUsername = async () => {
    setCheckLoading(true); 
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}cu/`, {
        uname: formData.uname,
      });
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignUpLoading(true); 
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}signup/`, formData);
      if (response.data.status) {
        alert("Signup successful!");
        navigate("/")
      } else {
        setUsernameAvailable(false);
      }
    } catch (error) {
      console.error("Error signing up:", error);
    } finally {
      setSignUpLoading(false); 
    }
  };

  return (
    <div className="signup-page-unique flex-center">
      <form onSubmit={handleSubmit} className="signup-form-unique">
        <h2 className="signup-title-unique">Sign Up</h2>

        <label htmlFor="name" className="signup-label-unique">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="signup-input-unique"
          required
          disabled={signUpLoading} 
        />

        <label htmlFor="username" className="signup-label-unique">
          Username
        </label>
        <div className="signup-username-container-unique">
          <input
            type="text"
            id="username"
            name="uname"
            value={formData.uname}
            onChange={handleChange}
            className="signup-input-unique"
            required
            disabled={signUpLoading || checkLoading} 
          />
          <button
            type="button"
            onClick={checkUsername}
            className="signup-check-btn-unique"
            disabled={checkLoading || signUpLoading} 
          >
            {checkLoading ? "Checking..." : "Check"}
          </button>
        </div>
        {usernameAvailable !== null && (
          <p
            className={`signup-username-status-unique ${
              usernameAvailable ? "available-unique" : "taken-unique"
            }`}
          >
            {usernameAvailable ? "Username is available" : "Username is taken"}
          </p>
        )}

        <label htmlFor="password" className="signup-label-unique">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="pas"
          value={formData.pas}
          onChange={handleChange}
          className="signup-input-unique"
          required
          disabled={signUpLoading} 
        />

        <button
          type="submit"
          className="signup-submit-btn-unique"
          disabled={signUpLoading} 
        >
          {signUpLoading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default Sign;
