import React from 'react';
import { Link } from 'react-router-dom';

export default function VorgangsVerwaltung() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Vorgangsverwaltung</h1>
      <div className="space-y-4">
        <p>Hier kannst du künftig:</p>
        <ul className="list-disc list-inside">
          <li>Alle Vorgänge ansehen</li>
          <li>Vorgänge nach Status filtern</li>
          <li>Vorgänge bearbeiten, löschen oder Status ändern</li>
        </ul>
        <div className="mt-6">
          <Link
            to="/vorgaenge"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Zur Vorgangsliste
          </Link>
        </div>
      </div>
    </div>
  );
}