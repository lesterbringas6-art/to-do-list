import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";

function Home() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedListId, setExpandedListId] = useState(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || 'https://to-do-list-1e06.onrender.com';

  // --- Global Axios Config ---
  // Adding this constant makes it easier to pass credentials
  const config = { withCredentials: true };

  const fetchData = async () => {
    try {
      // Added config here
      const response = await axios.get(`${API_URL}/get-lists`, config);
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

  // --- List Handlers ---
  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      // Added config here
      await axios.post(`${API_URL}/add-list`, { title: newListTitle }, config);
      setNewListTitle("");
      fetchData();
    } catch (err) { alert("Failed to add list"); }
  };

  const handleDeleteList = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this list?")) {
      try {
        // Added config here
        await axios.delete(`${API_URL}/delete-list/${id}`, config);
        setLists(lists.filter(list => list.id !== id));
      } catch (err) { alert("Error deleting list"); }
    }
  };

  const handleEditList = async (e, list) => {
    e.stopPropagation();
    const newTitle = prompt("Edit List Title:", list.title);
    if (newTitle && newTitle !== list.title) {
      try {
        // Added config here
        await axios.put(`${API_URL}/edit-list/${list.id}`, { title: newTitle, status: list.status }, config);
        fetchData();
      } catch (err) { alert("Error updating list"); }
    }
  };

  // --- Item Handlers ---
  const handleAddItem = async (e, listId) => {
    e.preventDefault();
    if (!newItemDesc.trim()) return;
    try {
      // Added config here
      await axios.post(`${API_URL}/add-items`, { list_id: listId, description: newItemDesc }, config);
      setNewItemDesc("");
      fetchData();
    } catch (err) { alert("Error adding item"); }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Delete this item?")) {
      try {
        // Added config here
        await axios.delete(`${API_URL}/delete-item/${itemId}`, config);
        fetchData();
      } catch (err) { alert("Error deleting item"); }
    }
  };

  const handleEditItem = async (item) => {
    const newDesc = prompt("Edit Item:", item.description);
    if (newDesc && newDesc !== item.description) {
      try {
        // Added config here
        await axios.put(`${API_URL}/edit-item/${item.id}`, {
          description: newDesc,
          status: item.status 
        }, config);
        fetchData();
      } catch (err) { alert("Error updating item"); }
    }
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === "pending" ? "completed" : "pending";
    try {
      // Added config here
      await axios.put(`${API_URL}/edit-item/${item.id}`, {
        description: item.description,
        status: newStatus
      }, config);
      fetchData();
    } catch (err) { alert("Error updating status"); }
  };

  const toggleList = (id) => {
    setExpandedListId(expandedListId === id ? null : id);
    setNewItemDesc(""); 
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start p-6">
        <div className="max-w-md w-full space-y-3">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Lists</h2>
          </div>

          <form onSubmit={handleAddList} className="flex gap-2 mb-6">
            <input 
              type="text"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="Create a new list..."
              className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-800 outline-none shadow-sm"
            />
            <button type="submit" className="bg-slate-800 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-700 active:scale-95 shadow-md">+</button>
          </form>

          {loading ? (
            <div className="text-center text-gray-500 text-sm">Loading...</div>
          ) : (
            lists.map((list) => (
              <div key={list.id} className="w-full">
                <div 
                  onClick={() => toggleList(list.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    expandedListId === list.id ? 'bg-slate-800 border-slate-800 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-700 hover:border-slate-400 shadow-sm'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-widest">{list.title}</span>
                  <div className="flex items-center gap-4">
                    <button onClick={(e) => handleEditList(e, list)} className="text-gray-400 hover:text-blue-400 text-xs">✎</button>
                    <button onClick={(e) => handleDeleteList(e, list.id)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                    <span className="text-xl font-light ml-2">{expandedListId === list.id ? '−' : '+'}</span>
                  </div>
                </div>

                {expandedListId === list.id && (
                  <div className="mt-2 ml-4 mr-2 p-4 bg-white rounded-b-xl border-x border-b border-gray-100 shadow-inner">
                    <form onSubmit={(e) => handleAddItem(e, list.id)} className="flex gap-2 mb-4">
                      <input 
                        type="text"
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        placeholder="Add an item..."
                        className="flex-grow text-sm px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-slate-500"
                      />
                      <button type="submit" className="bg-slate-200 text-slate-800 px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-300">+</button>
                    </form>

                    <ul className="space-y-2">
                      {list.items && list.items.length > 0 ? (
                        list.items.map((item) => (
                          <li key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 group">
                            <div className="flex flex-col">
                              <span className={`text-sm font-medium ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                                {item.description}
                              </span>
                              <span 
                                onClick={() => toggleStatus(item)}
                                className="text-[9px] font-bold cursor-pointer text-blue-500 uppercase hover:underline"
                              >
                                {item.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditItem(item)} className="text-gray-400 hover:text-blue-500 text-[10px]">EDIT</button>
                              <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-500 text-[10px]">DEL</button>
                            </div>
                          </li>
                        ))
                      ) : (
                        <p className="text-center text-gray-400 text-[11px] py-2 italic">No items yet.</p>
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