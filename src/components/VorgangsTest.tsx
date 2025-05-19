import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const VorgangsTest = () => {
  const [vorgaenge, setVorgaenge] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/vorgaenge`)
      .then(res => res.json())
      .then(data => setVorgaenge(data))
      .catch(err => console.error('Fehler beim Laden:', err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Vorgangsverwaltung (Test API Call)</h1>
      {vorgaenge.length === 0 ? (
        <p>Keine Vorgänge vorhanden.</p>
      ) : (
        <ul>
          {vorgaenge.map(vorgang => (
            <li key={vorgang.id}>
              {vorgang.empfaenger} – {vorgang.mrn} ({new Date(vorgang.erstelldatum).toLocaleDateString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VorgangsTest;