import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import ExportForm from './pages/ExportForm';
import VorgangsListe from './pages/VorgangsListe';
import VorgangDetail from './pages/VorgangDetail';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Navigation />
        <main className="pt-2 px-4">
          <Routes>
            <Route path="/" element={<ExportForm />} />
            <Route path="/verwaltung" element={<VorgangsListe />} />
            <Route path="/vorgaenge/:id" element={<VorgangDetail />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

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
