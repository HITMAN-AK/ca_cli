import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import Log from "./Log";
import Sign from "./Sign";
import Main from "./Main";

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const username = sessionStorage.getItem("uname");
      if (username) {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}cu/`,
            { uname: username }
          );
          if (response.data.status) {
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Error verifying authentication:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setLoading(false); 
    };

    checkAuthentication();
  }, []); 

  if (loading) {
    return <div className="loading-screen">Loading...</div>; 
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  return element;
};

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Log />} />
        <Route path="/sign-up" element={<Sign />} />
        <Route path="/main" element={<ProtectedRoute element={<Main />} />} />
      </Routes>
    </div>
  );
}

export default App;
