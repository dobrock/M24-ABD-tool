import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Vorgang {
  id: string;
  empfaenger: string;
  land: string;
  mrn: string;
  erstelldatum: string;
  status: string;
}

export default function VorgangsListe() {
  const [vorgaenge, setVorgaenge] = useState<Vorgang[]>([]);
  const navigate = useNavigate();

  const statusReihenfolge: string[] = ['angelegt', 'ausfuhr_beantragt', 'abd_erhalten', 'agv_vorliegend'];
  const statusIcons: any = {
    'angelegt': '🫨',
    'ausfuhr_beantragt': '🤞🏻',
    'abd_erhalten': '🥳',
    'agv_vorliegend': '✅',
  };
  const statusLabels: any = {
    'angelegt': 'Angelegt',
    'ausfuhr_beantragt': 'Ausfuhr beantragt',
    'abd_erhalten': 'ABD erhalten',
    'agv_vorliegend': 'AGV liegt vor',
  };

  const loadVorgaenge = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/vorgaenge`);
      const data = await res.json();
      setVorgaenge(data);
    } catch (err) {
      console.error('Fehler beim Laden:', err);
    }
  };

  const updateStatus = async (vorgang: Vorgang) => {
    const currentIndex = statusReihenfolge.indexOf(vorgang.status);
    const nextStatus = statusReihenfolge[(currentIndex + 1) % statusReihenfolge.length];

    try {
      await fetch(`${API_BASE_URL}/api/vorgaenge/${vorgang.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      loadVorgaenge();
    } catch (err) {
      console.error('Fehler beim Statuswechsel:', err);
    }
  };

  useEffect(() => {
    loadVorgaenge();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Diesen Vorgang wirklich löschen?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, { method: 'DELETE' });
      loadVorgaenge();
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Vorgänge</h1>
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
              <td className="px-4 py-2">
                <span
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => updateStatus(vorgang)}
                  title={`Klicke, um zu ${statusLabels[statusReihenfolge[(statusReihenfolge.indexOf(vorgang.status) + 1) % statusReihenfolge.length]]} zu wechseln`}
                >
                  {statusIcons[vorgang.status]} {statusLabels[vorgang.status]}
                </span>
              </td>
              <td className="px-4 py-2 text-xl flex gap-2">
                📥 📥 📥
              </td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  onClick={() => navigate(`/vorgaenge/${vorgang.id}`)}
                  className="hover:text-yellow-500"
                  title="Details / Bearbeiten"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(vorgang.id)}
                  className="hover:text-red-500"
                  title="Löschen"
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}