import React from 'react';

interface M24DashboardProps {
  ausfuhren: number;
  topLaender: { land: string; anzahl: number }[];
}

export default function M24Dashboard({ ausfuhren, topLaender }: M24DashboardProps) {
  const ersparnis = ausfuhren * 37.5;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-inner p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">📈 Dashboard: MOTORSPORT24 GmbH</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Ersparnis */}
        <div className="bg-white border rounded-xl p-4 shadow flex flex-col items-start">
          <div className="text-sm text-gray-500">Gespart seit Mai 2025</div>
          <div className="text-2xl font-bold text-green-600">
            {ersparnis.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>

        {/* Anzahl Ausfuhren */}
        <div className="bg-white border rounded-xl p-4 shadow flex flex-col items-start">
          <div className="text-sm text-gray-500">Anzahl Ausfuhren</div>
          <div className="text-2xl font-bold text-blue-600">{ausfuhren}</div>
        </div>

        {/* Top Zielländer */}
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
    </div>
  );
}
