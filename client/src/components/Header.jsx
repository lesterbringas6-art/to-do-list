import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Clear your auth tokens/session logic here
    // localStorage.removeItem('token'); 
    
    // 2. Redirect to the home page
    navigate('/');
  };

  return (
    <header className="bg-slate-800 p-4 shadow-lg flex justify-between items-center">
      {/* Spacer to keep title centered if needed, or just alignment */}
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