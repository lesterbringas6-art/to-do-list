import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";

function ListItem() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedListId, setExpandedListId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
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
    fetchData();
  }, [API_URL]);

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
            <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Click a list to view items</p>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 text-sm">Loading...</div>
          ) : (
            lists.map((list) => (
              <div key={list.id} className="w-full">
                <button 
                  onClick={() => toggleList(list.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 ${
                    expandedListId === list.id 
                    ? 'bg-slate-800 border-slate-800 text-white shadow-lg' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-slate-400 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold uppercase tracking-widest">{list.title}</span>
                  </div>
                  <span className="text-xl font-light">
                    {expandedListId === list.id ? '−' : '+'}
                  </span>
                </button>
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

export default ListItem;