import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Vorgang {
  id: string;
  kundename: string;
  mrn: string;
  status: string;
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

  const naechsteAktion = (vorgang: Vorgang) => {
    switch (vorgang.status) {
      case 'angelegt':
        return (
          <button
            onClick={() => handleStatusUpdate(vorgang.id, 'ausfuhr_beantragt')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          >
            ✔ Ausfuhr beantragt
          </button>
        );
      case 'ausfuhr_beantragt':
        return (
          <button
            onClick={() => handleStatusUpdate(vorgang.id, 'abd_erhalten')}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          >
            📄 ABD hochladen (simuliert)
          </button>
        );
      case 'abd_erhalten':
        return (
          <button
            onClick={() => handleStatusUpdate(vorgang.id, 'agv_vorliegend')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
          >
            ✔ AGV vorliegend
          </button>
        );
      case 'agv_vorliegend':
        return <span className="text-green-700">✅ Vorgang abgeschlossen</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Vorgänge (Status & Aktionen)</h1>
      {vorgaenge.length === 0 ? (
        <p>Keine Vorgänge vorhanden.</p>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Kundename</th>
              <th className="px-4 py-2">MRN</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Aktion</th>
              <th className="px-4 py-2">Löschen</th>
            </tr>
          </thead>
          <tbody>
            {vorgaenge.map((vorgang) => (
              <tr key={vorgang.id} className="border-b">
                <td className="px-4 py-2">{vorgang.kundename}</td>
                <td className="px-4 py-2">{vorgang.mrn}</td>
                <td className="px-4 py-2">{statusDarstellung(vorgang.status)}</td>
                <td className="px-4 py-2">{naechsteAktion(vorgang)}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(vorgang.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Löschen
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