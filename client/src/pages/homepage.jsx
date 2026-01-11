/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";


const Homepage = () => {
  const [values, setValues] = useState({
    username: "",
    room: "Python"
  });

  const navigate = useNavigate();



  const valueChanger = (e) => {
    setValues((evalues) => ({
      ...evalues,
      [e.target.name]: e.target.value
    }));
  };

  const joinRoomUsername = () => {
    if (values.username.trim() && values.room) {
      navigate(`/chat?username=${values.username}&room=${values.room}`);
    }
  };

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='h-[400px] w-[460px] bg-blue-500 rounded flex flex-col'>
        <h1 className='text-white flex justify-center items-center text-2xl font-bold h-20 w-full bg-blue-800 rounded-t'>
          ChatPlace
        </h1>
        <div className='flex flex-col items-center justify-around h-3/4'>
          <div className='flex flex-col w-3/4'>
            <label htmlFor="username" className='text-white'>Username</label>
            <input
              id="username"
              type='text'
              className='h-9 outline-none mt-2 p-2'
              name="username"
              required
              value={values.username}
              onChange={valueChanger}
              placeholder="Enter your username"
            />
          </div>
          <div className='flex flex-col w-3/4'>
            <label htmlFor="room" className='text-white'>Room</label>
            <select
              id="room"
              name="room"
              required
              value={values.room}
              onChange={valueChanger}
              className='bg-white h-9 mt-2 p-2'
            >
              <option value="Javascript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Php">PHP</option>
              <option value="C#">C#</option>
              <option value="Ruby">Ruby</option>
              <option value="Java">Java</option>
            </select>
          </div>
          <button
            className='text-white bg-blue-800 h-12 w-3/4 rounded hover:bg-blue-700'
            onClick={joinRoomUsername}
          >
            Join Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;