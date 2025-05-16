import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ExportForm from './pages/ExportForm';
import VorgangsListe from './pages/VorgangsListe';
import VorgangDetail from './pages/VorgangDetail';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ExportForm />} />
        <Route path="/verwaltung" element={<VorgangsListe />} />
        <Route path="/vorgaenge/:id" element={<VorgangDetail />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
