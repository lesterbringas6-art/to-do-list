import axios from 'axios'; // You can use fetch or axios

function Header() {
  const handleLogout = async () => {
    try {
      // 1. Tell the backend to destroy the session
      // We use credentials: 'include' to ensure the session cookie is sent
      const response = await fetch('https://to-do-list-1e06.onrender.com/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // 2. Redirect to login page or refresh to clear state
        window.location.href = '/login'; 
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
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
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md transition duration-200 font-medium text-sm"
      >
        Logout
      </button>
    </header>
  );
}

export default Header;