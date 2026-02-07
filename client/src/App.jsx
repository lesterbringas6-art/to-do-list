import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate

function App() {
  const [username, setUname] = useState('');
  const [password, setPass] = useState('');
  
  const navigate = useNavigate(); // 2. Initialize navigate

  const API_URL = import.meta.env.VITE_API_URL || 'https://to-do-list-1e06.onrender.com';

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password
      });

      if (response.data.success) {
        navigate('/home'); 
      }

    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Server error. Please try again.");
      }
    }
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-[#0061FF] to-[#60EFFF] flex flex-col items-center justify-center p-4">
      <div className="max-w-xs w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-6">
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-gray-800">Login</h2>
            <p className="text-gray-400 text-xs mt-1">Enter your credentials below</p>
          </div>

          <form className="space-y-3.5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                username
              </label>
              <input
                type="text" 
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUname(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                Password
              </label>
              <input 
                type="password" 
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>

            <button 
              type="button"
              onClick={handleLogin}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-md transition-colors text-sm shadow-sm">
                Login
            </button>
            
            <div className="flex justify-end mt-3 px-1">
              <p className="text-[11px] text-gray-500">
                {' '}
                <Link to="/register" className="text-slate-800 font-bold hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;