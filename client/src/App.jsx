import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/homepage'
import Chatpage from './pages/chatpage'
import ContextProvider from './context/ContextProvider'

const App = () => {
  return (
    <BrowserRouter>
    <ContextProvider>
    <Routes>
      <Route path="/" element={<Homepage/>}/>
      <Route path="/chat" element={<Chatpage/>}/>
    </Routes>
    </ContextProvider>
    </BrowserRouter>
  )
}

export default App