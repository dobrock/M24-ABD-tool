import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Vorgang {
  id: string;
  empfaenger: string;
  land: string;
  mrn: string;
  status: string;
  erstelldatum: string;
}

export default function VorgangsListe() {
  const [vorgaenge, setVorgaenge] = useState<Vorgang[]>([]);

  const loadVorgaenge = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/vorgaenge`);
      const data = await res.json();
      setVorgaenge(data);
    } catch (err) {
      console.error('Fehler beim Laden:', err);
    }
  };

  useEffect(() => {
    loadVorgaenge();
  }, []);

  const handleStatusUpdate = async (id: string, neuerStatus: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: neuerStatus }),
      });
      loadVorgaenge();
    } catch (err) {
      console.error('Fehler beim Status-Update:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Diesen Vorgang wirklich löschen?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, { method: 'DELETE' });
      loadVorgaenge();
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
    }
  };

  const statusDarstellung = (status: string) => {
    switch (status) {
      case 'angelegt':
        return <>📝 <span>Angelegt</span></>;
      case 'ausfuhr_beantragt':
        return <>🚛 <span>Ausfuhr beantragt</span></>;
      case 'abd_erhalten':
        return <>📄 <span>ABD erhalten</span></>;
      case 'agv_vorliegend':
        return <>✅ <span>AGV liegt vor</span></>;
      default:
        return <>❓ <span>Unbekannt</span></>;
    }
  };

  const renderDownloadIcons = (vorgang: Vorgang) => (
    <div className="flex gap-2 text-xl">
      <a href="#" title="PDF herunterladen">📥</a>
      <a href="#" title="Rechnung herunterladen">📥</a>
      {vorgang.status === 'agv_vorliegend' ? (
        <a href="#" title="AGV herunterladen">📥</a>
      ) : (
        <a href="#" title="ABD herunterladen">📥</a>
      )}
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4 text-left">Vorgänge</h1>
      {vorgaenge.length === 0 ? (
        <p>Keine Vorgänge vorhanden.</p>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="px-4 py-2">Empfänger</th>
              <th className="px-4 py-2">Zielland</th>
              <th className="px-4 py-2">MRN</th>
              <th className="px-4 py-2">Erstellt am</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Dokumente</th>
              <th className="px-4 py-2">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {vorgaenge.map((vorgang) => (
              <tr key={vorgang.id} className="border-b">
                <td className="px-4 py-2">{vorgang.empfaenger}</td>
                <td className="px-4 py-2">{vorgang.land}</td>
                <td className="px-4 py-2">{vorgang.mrn}</td>
                <td className="px-4 py-2">{new Date(vorgang.erstelldatum).toLocaleDateString()}</td>
                <td className="px-4 py-2">{statusDarstellung(vorgang.status)}</td>
                <td className="px-4 py-2">{renderDownloadIcons(vorgang)}</td>
                <td className="px-4 py-2 flex gap-2 text-xl">
                  <button
                    onClick={() => alert('Bearbeiten (Demo)')}
                    title="Bearbeiten"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(vorgang.id)}
                    title="Löschen"
                    className="text-red-600 hover:text-red-800"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}