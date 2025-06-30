import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://m24-abd-api-backend.onrender.com';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showVorgaengeFlyout, setShowVorgaengeFlyout] = useState(false);
  const [vorgaengeTimeout, setVorgaengeTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showAdminFlyout, setShowAdminFlyout] = useState(false);
  const [adminTimeout, setAdminTimeout] = useState<NodeJS.Timeout | null>(null);

  const linkClasses = (path: string) =>
    `block px-4 py-2 rounded ${
      location.pathname === path ? 'bg-white text-gray-800 font-semibold' : 'hover:bg-gray-700'
    }`;

  const startBackup = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/backup`, { method: 'POST' });
      if (!res.ok) throw new Error('Backup fehlgeschlagen');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_m24_abd_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}.dump`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('❌ Fehler beim Backup');
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

          <div
            className="relative"
            onMouseEnter={() => {
              if (vorgaengeTimeout) clearTimeout(vorgaengeTimeout);
              setShowVorgaengeFlyout(true);
            }}
            onMouseLeave={() => {
              const timeout = setTimeout(() => setShowVorgaengeFlyout(false), 300);
              setVorgaengeTimeout(timeout);
            }}
          >
            <button className="px-4 py-2 hover:bg-gray-700 rounded transition">Vorgänge</button>
            {showVorgaengeFlyout && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl text-sm text-gray-800 z-50">
            <button
              type="button"
              onClick={() => navigate('/vorgaenge?mandant=m24')}
              className="block w-full text-left px-4 py-3 hover:bg-blue-50 transition rounded-t-xl"
            >
              MOTORSPORT24
            </button>
            <button
              type="button"
              onClick={() => navigate('/vorgaenge?mandant=kk')}
              className="block w-full text-left px-4 py-3 hover:bg-blue-50 transition"
            >
              KK Automobile
            </button>
            <button
              type="button"
              onClick={() => navigate('/vorgaenge?mandant=alle')}
              className="block w-full text-left px-4 py-3 hover:bg-blue-50 transition rounded-b-xl"
            >
              Alle Vorgänge
            </button>
    </div>
  )}
</div>


          <div
            className="relative"
            onMouseEnter={() => {
              if (adminTimeout) clearTimeout(adminTimeout);
              setShowAdminFlyout(true);
            }}
            onMouseLeave={() => {
              const timeout = setTimeout(() => setShowAdminFlyout(false), 300);
              setAdminTimeout(timeout);
            }}
          >
            <button className="px-4 py-2 hover:bg-gray-700 rounded transition">Admin-Tools</button>
            {showAdminFlyout && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl text-sm text-gray-800 z-50">
                <Link to="/notizen" className="block px-4 py-3 hover:bg-blue-50 transition rounded-t-xl">
                  Update-Notizen
                </Link>
                <Link to="/versionsprotokoll" className="block px-4 py-3 hover:bg-blue-50 transition">
                  Versionsprotokoll
                </Link>
                <button
                  onClick={startBackup}
                  className="block w-full text-left px-4 py-3 hover:bg-blue-50 transition rounded-b-xl"
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
          <Link to="/vorgaenge?mandant=m24" className={linkClasses('/vorgaenge')} onClick={() => setOpen(false)}>
            Vorgänge M24
          </Link>

          <Link
            to="/vorgaenge?mandant=kk"
            className={linkClasses('/vorgaenge')}
            onClick={() => setOpen(false)}
          >
            Vorgänge KK
          </Link>

          <Link to="/vorgaenge?mandant=alle" className={linkClasses('/vorgaenge')} onClick={() => setOpen(false)}>
            Vorgänge (alle)
          </Link>
          <button onClick={startBackup} className="text-left hover:bg-gray-700 px-4 py-2 rounded text-sm">
            Sicherung: Manuelles Backup
          </button>
        </div>
      )}
    </nav>
  );
}
