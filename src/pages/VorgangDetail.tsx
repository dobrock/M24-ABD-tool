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

  const updateStatus = async (status: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/vorgaenge/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      loadVorgang();
    } catch (err) {
      console.error('Fehler beim Statuswechsel:', err);
    }
  };

  useEffect(() => {
    loadVorgang();
  }, [id]);

  const statusDarstellung = (status: string) => {
    switch (status) {
      case 'angelegt':
        return (
          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={() => updateStatus('ausfuhr_beantragt')}
            title="Klicken, um zu 'Ausfuhr beantragt' zu wechseln"
          >
            🫨 Angelegt
          </span>
        );
      case 'ausfuhr_beantragt':
        return (
          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={() => updateStatus('angelegt')}
            title="Klicken, um zurück zu 'Angelegt' zu wechseln"
          >
            🤞🏻 Ausfuhr beantragt
          </span>
        );
      case 'abd_erhalten':
        return <>🥳 ABD erhalten</>;
      case 'agv_vorliegend':
        return <>✅ AGV liegt vor</>;
      default:
        return <>❓ Unbekannt</>;
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

  const uploadForm = (type: string, label: string) => (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const fileInput = (e.target as any).elements.file;
        if (!fileInput.files.length) return alert('Bitte eine Datei wählen.');
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        const res = await fetch(`${API_BASE_URL}/api/vorgaenge/${id}/upload/${type}`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          alert(`${label} erfolgreich hochgeladen`);
          loadVorgang();
        } else {
          alert(`Fehler beim Hochladen ${label}`);
        }
      }}
      className="flex items-center gap-2 mb-2"
    >
      <input type="file" name="file" className="border rounded p-1" />
      <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">
        📤 {label} hochladen
      </button>
    </form>
  );

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
      </div>

      <h2 className="text-xl font-bold mt-6 mb-2">Dokumente</h2>
      <div className="flex gap-4 text-xl mb-4">
        {vorgang.hasPdf && (
          <a href={`${API_BASE_URL}/api/vorgaenge/${id}/download/pdf`} title="PDF herunterladen">📄</a>
        )}
        {vorgang.hasInvoice && (
          <a href={`${API_BASE_URL}/api/vorgaenge/${id}/download/rechnung`} title="Rechnung herunterladen">📄</a>
        )}
        {vorgang.hasAgv ? (
          <a href={`${API_BASE_URL}/api/vorgaenge/${id}/download/agv`} title="AGV herunterladen">📄</a>
        ) : vorgang.hasAbd ? (
          <a href={`${API_BASE_URL}/api/vorgaenge/${id}/download/abd`} title="ABD herunterladen">📄</a>
        ) : null}
      </div>

      <h2 className="text-xl font-bold mt-6 mb-2">Dokumente hochladen</h2>
      {uploadForm('pdf', 'PDF')}
      {uploadForm('rechnung', 'Rechnung')}
      {uploadForm('abd', 'ABD')}
      {uploadForm('agv', 'AGV')}

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