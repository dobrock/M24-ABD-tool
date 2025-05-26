// Navigation mit Flyout-Menüpunkt "Sicherung"

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://m24-abd-api-backend.onrender.com';

export default function Navigation() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showFlyout, setShowFlyout] = useState(false);

  const linkClasses = (path: string) =>
    `block px-4 py-2 rounded ${
      location.pathname === path
        ? 'bg-white text-gray-800 font-semibold'
        : 'hover:bg-gray-700'
    }`;

  const startBackup = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/backup`, { method: "POST" });
      if (!res.ok) throw new Error("Backup fehlgeschlagen");
      alert("✅ Backup wurde gestartet – Datei wird vorbereitet.");
    } catch (err) {
      alert("❌ Fehler beim Backup");
      console.error(err);
    }
  };

  return (
    <nav className="bg-gray-900 text-white shadow">
      <div className="max-w-4xl mx-auto pb-2 pt-2 flex justify-between items-center">
        <div className="text-lg font-bold">M24 ABD-Tool</div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex gap-4 items-center">
          <Link to="/" className={linkClasses('/')}>Formular</Link>
          <Link to="/verwaltung" className={linkClasses('/verwaltung')}>Vorgänge</Link>
          <div
            className="relative"
            onMouseEnter={() => setShowFlyout(true)}
            onMouseLeave={() => setShowFlyout(false)}
          >
            <button className="px-4 py-2 hover:bg-gray-700 rounded">Sicherung ▾</button>
            {showFlyout && (
              <div className="absolute top-full left-0 mt-1 bg-white text-gray-900 shadow rounded z-50 w-48 text-sm">
                <button
                  onClick={startBackup}
                  className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                >
                  Manuelles Backup
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2">
          <Link to="/" className={linkClasses('/')} onClick={() => setOpen(false)}>Formular</Link>
          <Link to="/verwaltung" className={linkClasses('/verwaltung')} onClick={() => setOpen(false)}>Vorgänge</Link>
          <button onClick={startBackup} className="text-left hover:bg-gray-700 px-4 py-2 rounded text-sm">
            Sicherung: Manuelles Backup
          </button>
        </div>
      )}
    </nav>
  );
}