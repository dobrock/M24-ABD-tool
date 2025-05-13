import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function VorgangDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vorgang, setVorgang] = useState<any>(null);

  const loadVorgang = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/vorgang/${id}`);
      if (res.ok) {
        const data = await res.json();
        setVorgang(data);
      } else {
        alert('Vorgang nicht gefunden');
        navigate('/verwaltung');
      }
    } catch (err) {
      console.error('Fehler beim Laden:', err);
    }
  };

  cconst statusDarstellung = (status: string) => {
    switch (status) {
      case 'angelegt':
        return (
          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={() => updateStatus('ausfuhr_beantragt')}
            title="Klicken, um zu 'Ausfuhr beantragt' zu wechseln"
          >
            📝 Angelegt
          </span>
        );
      case 'ausfuhr_beantragt':
        return (
          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={() => updateStatus('angelegt')}
            title="Klicken, um zu 'Angelegt' zurückzusetzen"
          >
            🚛 Ausfuhr beantragt
          </span>
        );
      case 'abd_erhalten':
        return <>📄 ABD erhalten</>;
      case 'agv_vorliegend':
        return <>✅ AGV liegt vor</>;
      default:
        return <>❓ Unbekannt</>;
    }
  };

  useEffect(() => {
    loadVorgang();
  }, [id]);

  const statusDarstellung = (status: string) => {
    switch (status) {
      case 'angelegt':
        return <>📝 Angelegt</>;
      case 'ausfuhr_beantragt':
        return <>🚛 Ausfuhr beantragt</>;
      case 'abd_erhalten':
        return <>📄 ABD erhalten</>;
      case 'agv_vorliegend':
        return <>✅ AGV liegt vor</>;
      default:
        return <>❓ Unbekannt</>;
    }
  };

  const nächsteStatusAktion = (status: string) => {
    switch (status) {
      case 'angelegt':
        return (
          <button
            onClick={() => updateStatus('ausfuhr_beantragt')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            ➡️ Ausfuhr beantragt
          </button>
        );
      case 'ausfuhr_beantragt':
        return (
          <button
            onClick={() => updateStatus('abd_erhalten')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            ➡️ ABD erhalten
          </button>
        );
      case 'abd_erhalten':
        return (
          <button
            onClick={() => updateStatus('agv_vorliegend')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            ➡️ AGV liegt vor
          </button>
        );
      default:
        return null;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Diesen Vorgang wirklich löschen?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, { method: 'DELETE' });
      navigate('/verwaltung');
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
    }
  };

  if (!vorgang) return <p>Vorgang wird geladen...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Details Vorgang</h1>

      <div className="space-y-4">
        <div><strong>Empfänger:</strong> {vorgang.empfaenger}</div>
        <div><strong>Zielland:</strong> {vorgang.land}</div>
        <div><strong>MRN:</strong> {vorgang.mrn}</div>
        <div><strong>Erstellt am:</strong> {new Date(vorgang.erstelldatum).toLocaleDateString()}</div>
        <div><strong>Status:</strong> {statusDarstellung(vorgang.status)}</div>
        <div>{nächsteStatusAktion(vorgang.status)}</div>
      </div>

      <h2 className="text-xl font-bold mt-6 mb-2">Dokumente</h2>
      <div className="flex gap-4 text-xl">
        <a href="#" title="PDF herunterladen">📥</a>
        <a href="#" title="Rechnung herunterladen">📥</a>
        {vorgang.status === 'agv_vorliegend' ? (
          <a href="#" title="AGV herunterladen">📥</a>
        ) : (
          <a href="#" title="ABD herunterladen">📥</a>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => alert('Bearbeiten (Demo)')}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          title="Bearbeiten"
        >
          ✏️ Bearbeiten
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          title="Löschen"
        >
          ❌ Löschen
        </button>
      </div>
    </div>
  );
}