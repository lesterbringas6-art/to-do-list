import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";

function Home() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedListId, setExpandedListId] = useState(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [status, setStatus] = useState({ message: '', isError: false });

  const API_URL = import.meta.env.VITE_API_URL || 'https://to-do-list-1e06.onrender.com';

  const showStatus = (message, isError = false) => {
    setStatus({ message, isError });
    setTimeout(() => setStatus({ message: '', isError: false }), 3000);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-lists`);
      setLists(response.data);
    } catch (err) {
      showStatus("Failed to load lists", true);
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
      await axios.post(`${API_URL}/add-list`, { title: newListTitle });
      setNewListTitle("");
      fetchData();
      showStatus("List created successfully!"); 
    } catch (err) { 
      showStatus("Failed to add list", true); 
    }
  };

  const handleDeleteList = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/delete-list/${id}`);
      setLists(lists.filter(list => list.id !== id));
      showStatus("List deleted");
    } catch (err) { 
      showStatus("Error deleting list", true); 
    }
  };

  const submitEditList = async (list) => {
    if (!editValue.trim() || editValue === list.title) {
      setEditingId(null);
      return;
    }
    try {
      await axios.put(`${API_URL}/edit-list/${list.id}`, { title: editValue, status: list.status });
      setEditingId(null);
      fetchData();
      showStatus("List title updated");
    } catch (err) { 
      showStatus("Error updating list", true); 
    }
  };

  // --- Item Handlers ---
  const handleAddItem = async (e, listId) => {
    e.preventDefault();
    if (!newItemDesc.trim()) return;
    try {
      await axios.post(`${API_URL}/add-items`, { list_id: listId, description: newItemDesc });
      setNewItemDesc("");
      fetchData();
      showStatus("Item added!");
    } catch (err) { 
      showStatus("Error adding item", true); 
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/delete-item/${itemId}`);
      fetchData();
      showStatus("Item removed");
    } catch (err) { 
      showStatus("Error deleting item", true); 
    }
  };

  const submitEditItem = async (item) => {
    if (!editValue.trim() || editValue === item.description) {
      setEditingId(null);
      return;
    }
    try {
      await axios.put(`${API_URL}/edit-item/${item.id}`, {
        description: editValue,
        status: item.status
      });
      setEditingId(null);
      fetchData();
      showStatus("Item updated");
    } catch (err) { 
      showStatus("Error updating item", true); 
    }
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === "pending" ? "completed" : "pending";
    try {
      await axios.put(`${API_URL}/edit-item/${item.id}`, {
        description: item.description,
        status: newStatus
      });
      fetchData();
      showStatus(`Item ${newStatus}`);
    } catch (err) { 
      showStatus("Error updating status", true); 
    }
  };

  const toggleList = (id) => {
    setExpandedListId(expandedListId === id ? null : id);
    setNewItemDesc("");
    setEditingId(null);
    setStatus({ message: '', isError: false }); 
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start p-6">
        <div className="max-w-md w-full space-y-3">
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Lists</h2>
          </div>

          {/* LIST MESSAGE: Above Create New List form */}
          {status.message && !expandedListId && (
            <div className={`text-center py-2 px-4 mb-2 rounded-lg text-[10px] font-bold shadow-sm transition-all ${
              status.isError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
            }`}>
              {status.message}
            </div>
          )}

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
                  {editingId === list.id ? (
                    <input 
                      autoFocus
                      className="bg-transparent border-b border-white outline-none text-xs font-bold uppercase tracking-widest w-1/2"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => submitEditList(list)}
                      onKeyDown={(e) => e.key === 'Enter' && submitEditList(list)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-widest">{list.title}</span>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(list.id);
                      setEditValue(list.title);
                    }} className="text-gray-400 hover:text-blue-400 text-xs">✎</button>
                    <button onClick={(e) => handleDeleteList(e, list.id)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                    <span className="text-xl font-light ml-2">{expandedListId === list.id ? '−' : '+'}</span>
                  </div>
                </div>

                {expandedListId === list.id && (
                  <div className="mt-2 ml-4 mr-2 p-4 bg-white rounded-b-xl border-x border-b border-gray-100 shadow-inner">
                    
                    {/* ITEM MESSAGE: Above Add Item form */}
                    {status.message && (
                      <div className={`mb-2 text-[10px] font-bold px-2 py-1.5 rounded transition-all ${
                        status.isError ? 'text-red-500 bg-red-50' : 'text-green-600 bg-green-50'
                      }`}>
                        {status.message}
                      </div>
                    )}

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
                            <div className="flex flex-col flex-grow">
                              {editingId === item.id ? (
                                <input 
                                  autoFocus
                                  className="text-sm font-medium text-gray-600 bg-white border rounded px-1 outline-none"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => submitEditItem(item)}
                                  onKeyDown={(e) => e.key === 'Enter' && submitEditItem(item)}
                                />
                              ) : (
                                <>
                                  <span className={`text-sm font-medium ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                                    {item.description}
                                  </span>
                                  <span 
                                    onClick={() => toggleStatus(item)}
                                    className="text-[9px] font-bold cursor-pointer text-blue-500 uppercase hover:underline w-fit"
                                  >
                                    {item.status}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => {
                                setEditingId(item.id);
                                setEditValue(item.description);
                              }} className="text-gray-400 hover:text-blue-500 text-[10px]">EDIT</button>
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