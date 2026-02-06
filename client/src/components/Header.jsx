import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleLogout = async () => {
    try {
      // 1. Tell the server to destroy the session
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });

      // 2. Clear local storage/state
      localStorage.removeItem('userName');

      // 3. Redirect to login page
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <header className="bg-slate-800 p-4 shadow-lg flex justify-between items-center px-8">
      {/* Spacer to keep title centered */}
      <div className="w-20"></div> 

      <h1 className="text-white text-3xl font-bold tracking-tight">
        To Do List
      </h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 px-4 rounded-md transition-colors shadow-md"
      >
        Logout
      </button>
    </header>
  );
}

export default Header;