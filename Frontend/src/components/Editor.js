import React, { useEffect, useRef, useCallback } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, selectedLanguage, onCodeChange }) => {
  const editorRef = useRef(null);

  // UseCallback to prevent unnecessary re-renders
  const handleCodeChange = useCallback((code) => {
    onCodeChange(code); // Trigger parent function
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code,
        selectedLanguage,
      });
    }
  }, [onCodeChange, roomId, selectedLanguage, socketRef]);

  useEffect(() => {
    const initEditor = () => {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById('realtimeEditor'),
        {
          mode: { name: selectedLanguage || 'javascript', json: true }, // Dynamically set language
          theme: 'dracula',
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        if (origin !== 'setValue') {
          handleCodeChange(code); // Use the wrapped function
        }
      });
    };

    initEditor();

    // Cleanup function for component unmount
    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
      }
    };
  }, [handleCodeChange, selectedLanguage]);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null && editorRef.current) {
          editorRef.current.setValue(code);
        }
      });

      // Cleanup socket listener on unmount
      return () => {
        socket.off(ACTIONS.CODE_CHANGE);
      };
    }
  }, [socketRef]);

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
