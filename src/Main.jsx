import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./css/main.css";

function Main() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const un = sessionStorage.getItem("uname");

  // Reference to the chat-body container
  const chatBodyRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}users/`
        );
        setUsers(response.data.filter((u) => u.uname !== un));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchData();
  }, [un]);

  useEffect(() => {
    if (selectedUser) {
      const ws = new WebSocket(
        `ws://localhost:8000/ws/chat/${un}/${selectedUser.uname}/`
      );
      console.log(
        `Connecting to WebSocket: ws://localhost:8000/ws/chat/${un}/`
      );
      ws.onopen = () => {
        console.log("WebSocket is connected!");
        setSocket(ws); // Store the WebSocket instance in the state
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log("Received message:", msg);

        if (
          (msg.sen === un && msg.rec === selectedUser.uname) ||
          (msg.sen === selectedUser.uname && msg.rec === un)
        ) {
          setMessages((prevMessages) => [...prevMessages, msg]);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
      };

      return () => {
        ws.close();
      };
    }
  }, [selectedUser, un]);

  const filteredUsers = users.filter((user) =>
    user.uname.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}sm/`, {
        sen: un,
        rec: user.uname,
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching initial messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      return;
    }
    if (socket) {
      const newMessage = {
        sen: un,
        rec: selectedUser.uname,
        message: message,
        time: new Date().toISOString(),
      };
      socket.send(JSON.stringify({ type: "sendMessage", ...newMessage }));
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");
    } else {
      try {
        const newMessage = {
          sen: un,
          rec: selectedUser.uname,
          mess: message,
          time: new Date().toISOString(),
        };
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}offmess/`,
          {
            sen: un,
            rec: selectedUser.uname,
            mess: message,
          }
        );
        if (response.data.status) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          console.log("Message queued for offline delivery:", response.data);
          setMessage("");
        }
      } catch (error) {
        console.error("Error queuing offline message:", error);
      }
    }
  };

  // Scroll to the latest message whenever the messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="app-container">
      <div className={`left-menu ${isMenuCollapsed ? "collapsed" : ""}`}>
        <button
          className="collapse-btn"
          onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
        >
          {isMenuCollapsed ? ">" : "<"}
        </button>
        <input
          type="text"
          placeholder="Search users by username ....."
          className="search-bar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="user-list">
          {filteredUsers.map((user) => (
            <div
              key={user.uname}
              className="user-card"
              onClick={() => handleUserClick(user)}
            >
              <h4>NAME : {user.name}</h4>
              <p>USERNAME: {user.uname}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        {selectedUser && (
          <div className="chat-container">
            <div className="chat-header">
              <h3>{selectedUser.name}</h3>
            </div>
            <div className="chat-body" ref={chatBodyRef}>
              {messages
                .filter((msg) => msg.mess && msg.mess.trim() !== "")
                .map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sen === un ? "sent" : "received"}`}
                  >
                    <p>{msg.mess}</p>
                    <span className="time">
                      {new Date(msg.time).toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
            <div className="chat-footer">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;
