import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Register from './pages/Register.jsx'
import  './css/globals.css/'

import { BrowserRouter,Routes,Route } from 'react-router-dom';
import ListItem from './pages/ListItem.jsx'
import Home from './pages/Home.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listitem" element={<ListItem />} />
        <Route path="/logout" element={<App  />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
