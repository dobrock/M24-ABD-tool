import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const VorgangsTest = () => {
  const [vorgaenge, setVorgaenge] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/vorgaenge`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Fehler ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then(data => setVorgaenge(data))
      .catch(err => {
        console.error('Fehler beim Laden:', err);
        setError('❌ Fehler beim Laden der Vorgänge. Bitte später erneut versuchen.');
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📋 Vorgangsverwaltung (Live-Daten)</h1>

      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      {!error && vorgaenge.length === 0 ? (
        <p className="text-gray-500">Keine Vorgänge vorhanden.</p>
      ) : (
        <ul className="space-y-2">
          {vorgaenge.map(vorgang => (
            <li key={vorgang.id} className="text-sm text-gray-800">
              <strong>{vorgang.empfaenger}</strong> – {vorgang.mrn || '⚠️ Keine MRN'}{' '}
              <span className="text-gray-500">
                ({new Date(vorgang.erstelldatum).toLocaleDateString()})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VorgangsTest;