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
  hasPdf: number;
  hasInvoice: number;
  hasAbd: number;
  hasAgv: number;
}

export default function VorgangsListe() {
  const [vorgaenge, setVorgaenge] = useState<Vorgang[]>([]);
  const navigate = useNavigate();

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

  const toggleStatus = async (vorgang: Vorgang) => {
    let newStatus = vorgang.status === 'angelegt' ? 'ausfuhr_beantragt' : 'angelegt';
    try {
      await fetch(`${API_BASE_URL}/api/vorgaenge/${vorgang.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadVorgaenge();
    } catch (err) {
      console.error('Fehler beim Statuswechsel:', err);
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

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Vorgänge</h1>
      {vorgaenge.length === 0 ? (
        <p>Keine Vorgänge vorhanden.</p>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden table-fixed">
          <thead className="bg-gray-200">
            <tr>
              <th className="w-48 text-left px-4 py-2">Empfänger</th>
              <th className="w-24 text-left px-4 py-2">Zielland</th>
              <th className="w-32 text-left px-4 py-2">MRN</th>
              <th className="w-32 text-left px-4 py-2">Erstellt am</th>
              <th className="w-48 text-left px-4 py-2">Status</th>
              <th className="w-40 text-center px-4 py-2">Dokumente</th>
              <th className="w-32 text-center px-4 py-2">Aktion</th>
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
                  {['angelegt', 'ausfuhr_beantragt'].includes(vorgang.status) ? (
                    <span
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => toggleStatus(vorgang)}
                      title="Klicken, um Status zu wechseln"
                    >
                      {statusIcons[vorgang.status]} {statusLabels[vorgang.status]}
                    </span>
                  ) : (
                    <span>{statusIcons[vorgang.status]} {statusLabels[vorgang.status]}</span>
                  )}
                </td>
                <td className="px-4 py-2 text-xl flex gap-2 justify-center">
                  {vorgang.hasPdf ? <a href="#" title="PDF herunterladen">📄</a> : null}
                  {vorgang.hasInvoice ? <a href="#" title="Rechnung herunterladen">📄</a> : null}
                  {vorgang.hasAgv ? (
                    <a href="#" title="AGV herunterladen">📄</a>
                  ) : vorgang.hasAbd ? (
                    <a href="#" title="ABD herunterladen">📄</a>
                  ) : null}
                </td>
                <td className="px-4 py-2 flex gap-2 justify-center">
                  <button
                    onClick={() => navigate(`/vorgaenge/${vorgang.id}`)}
                    title="Bearbeiten"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(vorgang.id)}
                    title="Löschen"
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