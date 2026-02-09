import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1. Call the backend logout route
      // Replace with your actual Render URL
      await axios.post('https://to-do-list-1e06.onrender.com/api/logout', {}, {
        withCredentials: true // MANDATORY: This sends the session cookie to the server
      });

      // 2. Clear any local state if you use it (optional)
      // localStorage.removeItem('user'); 

      // 3. Redirect to the login/home page
      navigate('/');
      
      // Optional: Force a refresh to clear any cached user data in the app state
      window.location.reload(); 
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if the server call fails, it's usually safer to redirect the user
      navigate('/');
    }
  };

  return (
    <header className="bg-slate-800 p-4 shadow-lg flex justify-between items-center">
      <div className="w-20"></div> 

      <h1 className="text-white text-3xl font-bold tracking-tight">
        To Do List
      </h1>

      <div className="w-20 flex justify-end">
        <button 
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;