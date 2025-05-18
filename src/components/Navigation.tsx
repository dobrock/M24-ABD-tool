// src/components/Navigation.tsx

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const linkClasses = (path: string) =>
    `block px-4 py-2 rounded ${
      location.pathname === path
        ? 'bg-white text-gray-800 font-semibold'
        : 'hover:bg-gray-700'
    }`;

  return (
    <nav className="bg-gray-900 text-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">M24 ABD-Tool</div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex gap-4">
          <Link to="/" className={linkClasses('/')}>Formular</Link>
          <Link to="/verwaltung" className={linkClasses('/verwaltung')}>Vorgänge</Link>
        </div>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2">
          <Link to="/" className={linkClasses('/')} onClick={() => setOpen(false)}>Formular</Link>
          <Link to="/verwaltung" className={linkClasses('/verwaltung')} onClick={() => setOpen(false)}>Vorgänge</Link>
        </div>
      )}
    </nav>
  );
}
