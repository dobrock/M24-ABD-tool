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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ kundename: '', mrn: '', status: 'offen' });

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Diesen Vorgang wirklich löschen?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, { method: 'DELETE' });
      loadVorgaenge();
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
    }
  };

  const handleEdit = (vorgang: Vorgang) => {
    setEditingId(vorgang.id);
    setEditData({ kundename: vorgang.kundename, mrn: vorgang.mrn, status: vorgang.status });
  };

  const handleUpdate = async (id: string) => {
    if (!editData.kundename || !editData.mrn) {
      alert('Bitte Kundename und MRN eingeben.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setEditingId(null);
        loadVorgaenge();
      } else {
        alert('Fehler beim Speichern');
      }
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Vorgänge (Bearbeiten / Löschen / Status)</h1>
      {vorgaenge.length === 0 ? (
        <p>Keine Vorgänge vorhanden.</p>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Kundename</th>
              <th className="px-4 py-2">MRN</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {vorgaenge.map((vorgang) => (
              <tr key={vorgang.id} className="border-b">
                <td className="px-4 py-2">
                  {editingId === vorgang.id ? (
                    <input
                      type="text"
                      value={editData.kundename}
                      onChange={(e) => setEditData({ ...editData, kundename: e.target.value })}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    vorgang.kundename
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === vorgang.id ? (
                    <input
                      type="text"
                      value={editData.mrn}
                      onChange={(e) => setEditData({ ...editData, mrn: e.target.value })}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    vorgang.mrn
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === vorgang.id ? (
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="border rounded px-2 py-1"
                    >
                      <option value="offen">offen</option>
                      <option value="fertig">fertig</option>
                      <option value="storniert">storniert</option>
                    </select>
                  ) : (
                    vorgang.status
                  )}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  {editingId === vorgang.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(vorgang.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Speichern
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                      >
                        Abbrechen
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(vorgang)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDelete(vorgang.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Löschen
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}