import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1. Call the backend logout endpoint
      const response = await fetch('https://to-do-list-1e06.onrender.com/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Important: Include credentials to send the session cookie
        credentials: 'include', 
      });

      if (response.ok) {
        // 2. Clear any local state if you have it (optional)
        // localStorage.removeItem('user'); 

        // 3. Redirect to the login or home page
        navigate('/');
      } else {
        console.error('Logout failed on the server');
      }
    } catch (error) {
      console.error('Error during logout:', error);
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
          className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;