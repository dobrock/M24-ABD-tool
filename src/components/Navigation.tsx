// src/components/Navigation.tsx

import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  const linkClasses = (path: string) =>
    `px-4 py-2 rounded ${
      location.pathname === path
        ? 'bg-white text-gray-800 font-semibold'
        : 'hover:bg-gray-700'
    }`;

  return (
    <nav className="bg-gray-800 text-white shadow">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-14 items-center">
          <div className="flex gap-4 items-center">
            <Link to="/" className={linkClasses('/')}>
              Formular
            </Link>
            <Link to="/verwaltung" className={linkClasses('/verwaltung')}>
              Vorgänge
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}