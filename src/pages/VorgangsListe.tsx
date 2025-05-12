import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function VorgangsListe() {
  const [vorgaenge, setVorgaenge] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/vorgaenge')
      .then(res => res.json())
      .then(data => setVorgaenge(data))
      .catch(err => console.error('Fehler beim Laden:', err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Vorgänge</h1>
      {vorgaenge.length === 0 ? (
        <p>Keine Vorgänge vorhanden.</p>
      ) : (
        <ul className="space-y-2">
          {vorgaenge.map(vorgang => (
            <li key={vorgang.id} className="border p-4 rounded bg-gray-50">
              <Link to={`/vorgaenge/${vorgang.id}`} className="text-blue-500 hover:underline">
                {vorgang.kundename} - {vorgang.mrn} ({vorgang.erstelldatum})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
