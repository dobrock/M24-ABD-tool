import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KundenDashboardProps {
  mandantName: string;
  ausfuhren: number;
  umsatz: number;
  topLaender: { land: string; anzahl: number }[];
  visible: boolean;
}

export default function KundenDashboard({
  mandantName,
  ausfuhren,
  umsatz,
  topLaender,
  visible
}: KundenDashboardProps) {
  const kundendaten = {
    firma: 'KK Automobile GmbH',
    anschrift: 'Obere Str. 17a',
    ort: '37589 Düderode',
    ansprechpartner: 'Sven-Maik Krüger',
    telefon: '05553 3163',
    email: 'info@kk-automobile.de',
    eori: 'DE1234567890',
    vollmachtDatum: '20.06.2025'
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="dashboard"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden bg-gray-50 border border-gray-200 rounded-xl shadow-inner p-4 mb-6"
        >
          <h3 className="text-lg font-semibold mb-4">📈 Dashboard: {mandantName}</h3>

          {/* 🏷 Kundendaten als kompakte Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm text-sm text-gray-700 leading-relaxed">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-8">
              <div className="space-y-1">
                <div><span className="font-medium">🏢 Firma:</span> {kundendaten.firma}</div>
                <div><span className="font-medium">📍 Anschrift:</span> {kundendaten.anschrift}, {kundendaten.ort}</div>
                <div><span className="font-medium">🔒 EORI:</span> {kundendaten.eori}</div>
                <div><span className="font-medium">📎 Vollmacht hochgeladen am:</span> {kundendaten.vollmachtDatum}</div>
              </div>
              <div className="space-y-1 mt-4 sm:mt-0">
                <div><span className="font-medium">👤 Ansprechpartner:</span> {kundendaten.ansprechpartner}</div>
                <div><span className="font-medium">☎️ Telefon:</span> {kundendaten.telefon}</div>
                <div><span className="font-medium">✉️ E-Mail:</span> {kundendaten.email}</div>
              </div>
            </div>
          </div>

          {/* 📊 Statistiken */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border rounded-xl p-4 shadow flex flex-col items-start">
              <div className="text-sm text-gray-500">Umsatz (netto)</div>
              <div className="text-2xl font-bold text-green-600">
                {(umsatz ?? 0).toLocaleString('de-DE', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </div>
            </div>

            <div className="bg-white border rounded-xl p-4 shadow flex flex-col items-start">
              <div className="text-sm text-gray-500">Anzahl Ausfuhren</div>
              <div className="text-2xl font-bold text-blue-600">{ausfuhren}</div>
            </div>

            <div className="bg-white border rounded-xl p-4 shadow">
              <div className="text-sm text-gray-500 mb-2">Top-Zielländer</div>
              <ul className="text-sm text-gray-800 space-y-1">
                {topLaender.map((eintrag, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{eintrag.land}</span>
                    <span className="text-gray-500">{eintrag.anzahl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
