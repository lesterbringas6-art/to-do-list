import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'https://to-do-list-1e06.onrender.com';

  const handleLogout = async () => {
    try {
      // 1. Tell the server to destroy the session
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      
      // 2. Clear any local data (if you had any)
      // localStorage.clear(); 

      // 3. Redirect to the login page
      navigate('/');
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if the server call fails, we usually want to redirect the user
      navigate('/');
    }
  };

  return (
    <header className="bg-slate-800 p-4 shadow-lg flex justify-between items-center">
      {/* Spacer to keep title centered */}
      <div className="w-20"></div> 

      <h1 className="text-white text-3xl font-bold tracking-tight">
        To Do List
      </h1>

      <div className="w-20 flex justify-end">
        <button 
          onClick={handleLogout}
          className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;