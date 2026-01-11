/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io } from "socket.io-client";

const Chatpage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const room = searchParams.get("room");
  const username = searchParams.get("username");

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!room || !username) {
      navigate("/");
      return;
    }

    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    // Join the room
    newSocket.emit("join-room&add-username", room, username);

    // Listen for join confirmation
    newSocket.on("joined-room", (data) => {
      console.log(data.message);
      setUsers(data.users);
      // Add system message
      setMessages(prev => [...prev, {
        type: 'system',
        message: data.message,
        timestamp: Date.now()
      }]);
    });

    // Listen for when another user joins
    newSocket.on("user-joined", (data) => {
      console.log(data.message);
      setUsers(data.users);
      // Add system message
      setMessages(prev => [...prev, {
        type: 'system',
        message: data.message,
        timestamp: Date.now()
      }]);
    });

    // Listen for when a user leaves
    newSocket.on("user-left", (data) => {
      console.log(data.message);
      setUsers(data.users);
      // Add system message
      setMessages(prev => [...prev, {
        type: 'system',
        message: data.message,
        timestamp: Date.now()
      }]);
    });

    // Listen for chat messages
    newSocket.on("messages", (data) => {
      setMessages(prev => [...prev, {
        type: 'chat',
        username: data.username,
        message: data.message,
        timestamp: data.timestamp
      }]);
    });

    // Listen for leave confirmation
    newSocket.on("left-room", (data) => {
      console.log(data.message);
      navigate("/");
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [room, username, navigate]);

  const leaveroom = () => {
    if (socket) {
      socket.emit("leave-room", room);
    }
  };

  const sendMessage = () => {
    if (socket && messageInput.trim()) {
      socket.emit("send-message", room, messageInput);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className='flex flex-col justify-center items-center h-screen bg-gray-100'>
      <div className='flex flex-col w-[880px] bg-blue-500 rounded shadow-lg'>
        <nav className='flex justify-between items-center w-full bg-blue-900 p-4 rounded-t'>
          <h1 className='text-white text-3xl font-bold'>Chatplace</h1>
          <button
            className='bg-blue-800 text-white rounded p-2 hover:bg-blue-700 transition'
            onClick={leaveroom}
          >
            Leave Room
          </button>
        </nav>

        <section className='flex p-4 gap-4'>
          <div className='flex flex-col w-48'>
            <div className='mb-4'>
              <h2 className='text-white font-bold text-lg'>Room:</h2>
              <p className='text-white mt-1 bg-blue-600 p-2 rounded'>{room}</p>
            </div>
            <div>
              <h2 className='text-white font-bold text-lg'>Users ({users.length}):</h2>
              <div className='mt-2 space-y-1'>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <p
                      key={index}
                      className='text-white bg-blue-600 p-2 rounded'
                    >
                      {user}
                    </p>
                  ))
                ) : (
                  <p className='text-white text-sm'>No users yet</p>
                )}
              </div>
            </div>
          </div>

          <div className='flex flex-col bg-white h-[455px] w-full rounded overflow-y-auto p-4'>
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index} className='mb-3'>
                  {msg.type === 'system' ? (
                    <div className='text-center text-gray-500 text-sm italic'>
                      {msg.message}
                    </div>
                  ) : (
                    <div className='flex flex-col'>
                      <span className='font-bold text-blue-700'>{msg.username}</span>
                      <span className='text-gray-800'>{msg.message}</span>
                      <span className='text-xs text-gray-400'>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className='text-center text-gray-400 mt-10'>
                No messages yet. Start the conversation!
              </div>
            )}
          </div>
        </section>

        <div className='flex bg-blue-900 p-4 rounded-b'>
          <input
            className='w-full p-2 outline-none rounded-l'
            placeholder='Type a message...'
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className='bg-blue-800 px-6 text-white rounded-r hover:bg-blue-700 transition'
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatpage;