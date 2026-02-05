import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";

function Home() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedListId, setExpandedListId] = useState(null);
  
  // State for the new list title input
  const [newListTitle, setNewListTitle] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || 'https://to-do-list-1e06.onrender.com';

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-lists`);
      setLists(response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_URL]);

  // --- Handler Functions ---

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      await axios.post(`${API_URL}/add-list`, {
        title: newListTitle
      });
      setNewListTitle(""); // Clear the input field
      fetchData(); // Refresh the list from the database
    } catch (err) {
      console.error("Error adding list:", err);
      alert("Failed to add list");
    }
  };

  const handleDeleteList = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this list?")) {
      try {
        await axios.delete(`${API_URL}/delete-list/${id}`);
        setLists(lists.filter(list => list.id !== id));
      } catch (err) {
        alert("Error deleting list");
      }
    }
  };

  const handleEditList = async (e, list) => {
    e.stopPropagation();
    const newTitle = prompt("Edit List Title:", list.title);
    if (newTitle && newTitle !== list.title) {
      try {
        await axios.put(`${API_URL}/edit-list/${list.id}`, {
          title: newTitle,
          status: list.status
        });
        fetchData();
      } catch (err) {
        alert("Error updating list");
      }
    }
  };

  const toggleList = (id) => {
    setExpandedListId(expandedListId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-start p-6">
        <div className="max-w-md w-full space-y-3">
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 text-uppercase tracking-tight">Lists</h2>
          </div>

          {/* Add List Form */}
          <form onSubmit={handleAddList} className="flex gap-2 mb-6">
            <input 
              type="text"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="Create a new list..."
              className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-800 outline-none transition-all shadow-sm"
            />
            <button 
              type="submit"
              className="bg-slate-800 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all active:scale-95 shadow-md"
            >
              +
            </button>
          </form>

          {loading ? (
            <div className="text-center text-gray-500 text-sm">Loading...</div>
          ) : (
            lists.map((list) => (
              <div key={list.id} className="w-full">
                <div 
                  onClick={() => toggleList(list.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    expandedListId === list.id 
                    ? 'bg-slate-800 border-slate-800 text-white shadow-lg' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-slate-400 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold uppercase tracking-widest">{list.title}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => handleEditList(e, list)}
                      className="text-gray-400 hover:text-blue-400 text-xs transition-colors"
                    >
                      ✎
                    </button>
                    <button 
                      onClick={(e) => handleDeleteList(e, list.id)}
                      className="text-gray-400 hover:text-red-500 text-xs transition-colors"
                    >
                      ✕
                    </button>
                    <span className="text-xl font-light ml-2">
                      {expandedListId === list.id ? '−' : '+'}
                    </span>
                  </div>
                </div>

                {expandedListId === list.id && (
                  <div className="mt-2 ml-4 mr-2 p-4 bg-white rounded-b-xl border-x border-b border-gray-100 shadow-inner animate-in fade-in slide-in-from-top-2">
                    <ul className="space-y-2">
                      {list.items && list.items.length > 0 ? (
                        list.items.map((item) => (
                          <li key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                            <span className="text-sm text-gray-600 font-medium">{item.description}</span>
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                    {item.status}
                                </span>
                            </div>
                          </li>
                        ))
                      ) : (
                        <p className="text-center text-gray-400 text-[11px] py-2 italic">No items assigned to this list.</p>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;