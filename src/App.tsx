import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ExportForm from './pages/ExportForm';
import VorgangsListe from './pages/VorgangsListe';
import VorgangDetail from './pages/VorgangDetail';
import VorgangNeu from './pages/VorgangNeu';
import VorgangsVerwaltung from "./pages/VorgangsVerwaltung";

export default function App() {
  return (
    <Router>
      <nav className="bg-gray-800 p-4 text-white flex gap-4">
        <Link to="/">Neue Ausfuhranmeldung</Link>
        <Link to="/vorgaenge">Vorgänge verwalten</Link>
        <Link to="/vorgang-neu">Neuer Vorgang</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ExportForm />} />
        <Route path="/vorgaenge" element={<VorgangsListe />} />
        <Route path="/vorgang-neu" element={<VorgangNeu />} />
        <Route path="/vorgaenge/:id" element={<VorgangDetail />} />
        <Route path="/verwaltung" element={<VorgangsVerwaltung />} />
      </Routes>
    </Router>
  );
}