import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [username, setUname] = useState('');
  const [password, setPass] = useState('');
  const [confirmPassword, setConfirmPass] = useState('');
  
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'https://to-do-list-1e06.onrender.com';

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg(''); 

    if (password !== confirmPassword) {
      setMsg("Passwords do not match!");
      setIsError(true);
      // Clear error after 3 seconds
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/register`, {
        name, 
        username,
        password,
        confirm: confirmPassword 
      });

      if (response.data.success) {
        setMsg("Registration Successful! Redirecting...");
        setIsError(false);
        
        // Clear inputs
        setName('');
        setUname('');
        setPass('');
        setConfirmPass('');

        // Redirect to login after 1.5 seconds
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      setMsg(error.response?.data?.message || "Server error");
      setIsError(true);
      // Clear error after 3 seconds
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-xs w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-6">
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-400 text-xs mt-1">Please fill in your details</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            
            {/* MESSAGE AREA: Above FullName, zero space when empty */}
            {msg && (
              <div className="transition-all duration-300">
                <div className={`w-full text-center py-2 px-2 rounded-lg text-[10px] font-bold mb-2 ${
                  isError 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {msg}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                FullName
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all text-sm"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                Username
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all text-sm"
                placeholder="Enter your username"
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
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all text-sm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!isError && msg !== ''} // Disable during successful redirect
              className={`w-full ${(!isError && msg !== '') ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-900'} text-white font-bold py-2 rounded-md transition-colors text-sm shadow-sm mt-2 active:scale-95`}
            >
              {(!isError && msg !== '') ? 'Redirecting...' : 'Register'}
            </button>

            <div className="flex justify-center mt-3">
              <p className="text-[11px] text-gray-500">
                Already have an account?{' '}
                <Link to="/" className="text-slate-800 font-bold hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;