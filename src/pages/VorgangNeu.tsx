import React, { useState } from 'react';

export default function VorgangNeu() {
  const [kundename, setKundename] = useState('');
  const [mrn, setMrn] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kundename || !mrn) {
      alert('Bitte alle Felder ausfüllen');
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/vorgaenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kundename,
          mrn,
          erstelldatum: new Date().toISOString().split('T')[0]
        })
      });
      if (response.ok) {
        alert('Vorgang erfolgreich angelegt');
        setKundename('');
        setMrn('');
      } else {
        alert('Fehler beim Anlegen');
      }
    } catch (err) {
      console.error('Fehler:', err);
      alert('Serverfehler');
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-bold mb-4">Neuen Vorgang anlegen</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Kundenname</label>
          <input
            type="text"
            value={kundename}
            onChange={(e) => setKundename(e.target.value)}
            placeholder="z.B. Müller GmbH"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">MRN</label>
          <input
            type="text"
            value={mrn}
            onChange={(e) => setMrn(e.target.value)}
            placeholder="z.B. 22DE1234567890"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
        >
          Vorgang speichern
        </button>
      </form>
    </div>
  );
}
