import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import Client from '../components/Client';
import Editor from '../components/Editor';
import LanguageSelector from "../components/LanguageSelector";
import Output from "../components/Output";
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import ACTIONS from '../Actions';
import { Link } from 'react-router-dom';

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef('');
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize socket connection
        socketRef.current = await initSocket();

        // Error handling for socket connection
        socketRef.current.on('connect_error', handleErrors);
        socketRef.current.on('connect_failed', handleErrors);

        function handleErrors(e) {
          console.error('Socket error:', e);
          toast.error('Socket connection failed, try again later.');
          reactNavigator('/');
        }

        // Join the room
        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username: location.state?.username,
          selectedLanguage,
        });

        // Handle user joining the room
        socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId, language }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          if (language) setSelectedLanguage(language);

          // Sync code with the new user
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
            selectedLanguage,
          });
        });

        // Handle user disconnecting
        socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
          toast.success(`${username} left the room.`);
          setClients((prev) => prev.filter((client) => client.socketId !== socketId));
        });

        // Handle language change
        socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language }) => {
          if (language) {
            setSelectedLanguage(language);
          }
        });
      } catch (err) {
        console.error('Socket initialization failed:', err);
      }
    };

    init();

    // Cleanup socket connection on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off(ACTIONS.LANGUAGE_CHANGE);
      }
    };
  }, [roomId, reactNavigator, selectedLanguage, location.state?.username]);

  // Handle room ID copy to clipboard
  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been copied to your clipboard');
    } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
    }
  }

  // Handle leaving the room
  function leaveRoom() {
    reactNavigator('/');
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  // Handle language selection
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
      roomId,
      language,
    });
  };

  // Handle code changes
  const handleCodeChange = (code) => {
    codeRef.current = code;
  };

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <Link to="/">
              <img className="LogoImage" src="/Logo.png" alt="Logo" />
            </Link>
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        <LanguageSelector language={selectedLanguage} onSelect={handleLanguageSelect} />
        <div style={{ display: 'flex' }}>
          <div style={{ flex: '1' }}>
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              selectedLanguage={selectedLanguage}
              onCodeChange={handleCodeChange}
            />
          </div>
          <div style={{ flex: '1', padding: '10px' }}>
            <Output editorRef={codeRef} language={selectedLanguage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
