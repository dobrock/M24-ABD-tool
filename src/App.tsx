import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import ExportForm from './pages/ExportForm';
import VorgangsListe from './pages/VorgangsListe';
import VorgangDetail from './pages/VorgangDetail';
import { Toaster } from 'react-hot-toast';
import Notizen from './pages/Notizen';
import VersionsProtokoll from './pages/VersionsProtokoll';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<ExportForm />} />
          <Route path="/verwaltung" element={<VorgangsListe />} />
          <Route path="/vorgaenge" element={<VorgangsListe />} /> {/* ← NEU */}
          <Route path="/vorgaenge/:id" element={<VorgangDetail />} />
          <Route path="/notizen" element={<Notizen />} />
          <Route path="/versionsprotokoll" element={<VersionsProtokoll />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* ✅ Toaster für Erfolg/Fehler-Meldungen – sichtbar oben zentriert */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              fontSize: '14px',
            },
            success: {
              icon: '✅',
            },
            error: {
              icon: '❌',
            },
          }}
        />
      </div>
    </Router>
  );
}
