import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  // Function to create a new room
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success('Created a new room!');
  };

  // Navigate to Chatbot
  const goToChatbot = () => {
    navigate('/chatbot');
  };

  // Function to join a room
  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      toast.error('Both Room ID and Username are required!');
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  // Handle "Enter" key to join the room
  const handleInputEnter = (e) => {
    if (e.key === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img className="homePageLogo" src="/Logo.png" alt="SynCode Logo" />
        <h4 className="mainLabel">Paste invitation Room ID</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="Room ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyDown={handleInputEnter}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyDown={handleInputEnter}
          />

          <button className="btn joinBtn" onClick={joinRoom}>
            Join Room
          </button>
          <button className="btn chatbotBtn" onClick={goToChatbot}>
            Go to Chatbot
          </button>
          <span className="createInfo">
            Don’t have an invite? Create &nbsp;
            <a
              onClick={createNewRoom}
              href="/"
              className="createNewBtn"
              role="button"
            >
              a new room
            </a>
          </span>
        </div>
      </div>
      <footer>
        <h4>
          Built with 💛 by &nbsp;
          <a href="https://github.com/anveshajain19/CodeSphere" target="_blank" rel="noopener noreferrer">
            Group 18 Major Project
          </a>
        </h4>
      </footer>
    </div>
  );
};

export default Home;
