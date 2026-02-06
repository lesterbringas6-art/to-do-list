import axios from 'axios';

function Header() {
  const handleLogout = async () => {
    try {

      const response = await axios.post('https://to-do-list-1e06.onrender.com/register', {}, {
        withCredentials: true 
      });

      if (response.data.success) {
        // Redirect user to login page or refresh
        window.location.href = '/register'; 
      }
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Error logging out. Please try again.");
    }
  };

  return (
    <header className="bg-slate-800 p-4 shadow-lg flex justify-between items-center">
      {/* Spacer to keep title centered if needed, or just let it flex */}
      <div className="w-20"></div> 

      <h1 className="text-white text-3xl font-bold tracking-tight">
        To Do List
      </h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors font-medium"
      >
        Logout
      </button>
    </header>
  );
}

export default Header;