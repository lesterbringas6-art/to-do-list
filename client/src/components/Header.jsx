import { useNavigate } from 'react-router-dom'; // Assuming you use react-router

function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('https://to-do-list-neon-two-40.vercel.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // CRITICAL: This allows the browser to send the session cookie to Render
        credentials: 'include', 
      });

      const data = await response.json();

      if (data.success) {
        navigate('/');
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-slate-800 p-4 shadow-lg flex justify-between items-center">
      {/* Spacer to keep title centered */}
      <div className="w-20"></div> 

      <h1 className="text-white text-3xl font-bold tracking-tight">
        To Do list
      </h1>

      <button 
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
      >
        Logout
      </button>
    </header>
  );
}

export default Header;