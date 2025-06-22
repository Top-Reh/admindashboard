import './App.css';
import './index.css';
import React, { useState } from 'react';
import { useAuth } from './Auths/authContext';
import ImagesPage from './tabs/imagepage';
import BlogsPage from './tabs/blogspage';
import EventsPage from './tabs/eventpage';
import ColorThemePage from './tabs/colorthemepage';
import Aboutpage from './tabs/aboutpage';

function App() {
    const { logout } = useAuth();
    const [tab, setTab] = useState("images");

    const handleLogout = async () => {
      await logout();
    };

    return (
      <div className="flex min-h-screen">
        <Sidebar currentTab={tab} onTabChange={setTab} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-10 max-w-7xl mx-auto">
          {tab === "images" && <ImagesPage />}
          {tab === "events" && <EventsPage />}
          {tab === "blogs" && <BlogsPage />}
          {tab === "color" && <ColorThemePage />}
          {tab === "about" && <Aboutpage />}
        </main>
      </div>
    );
}

export default App;

  // Navigation sidebar component
  function Sidebar({ currentTab, onTabChange, onLogout }) {
    const tabs = [
      { id: "images", label: "Images" },
      { id: "about", label: "About us" },
      { id: "events", label: "Events" },
      { id: "blogs", label: "Blogs" },
      { id: "color", label: "Color Theme" },
    ];

    return (
      <nav className="flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-gray-200 px-6 py-8 overflow-y-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 select-none mb-6">Dashboard</h1>
          <ul className="space-y-4">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full text-left font-medium p-2 rounded-lg transition duration-150 ${
                    currentTab === tab.id
                      ? "bg-black text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onLogout}
          className="mt-auto py-3 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition"
        >
          Log Out
        </button>
      </nav>
    );
  }