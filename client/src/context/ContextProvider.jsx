/* eslint-disable react-refresh/only-export-components */
import React, { createContext } from 'react'


export let ContextData = createContext();
const ContextProvider = ({ children }) => {
  let sockets = {}; // No global socket connection
  return (
    <ContextData.Provider value={sockets}>
      {children}
    </ContextData.Provider>
  );
}

export default ContextProvider