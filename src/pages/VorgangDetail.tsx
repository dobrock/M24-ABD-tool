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

  useEffect(() => {
    loadVorgang();
  }, [id]);

  const toggleStatus = async () => {
    const newStatus = vorgang.status === 'angelegt' ? 'ausfuhr_beantragt' : 'angelegt';
    try {
      await fetch(`${API_BASE_URL}/api/vorgaenge/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadVorgang();
    } catch (err) {
      console.error('Fehler beim Statuswechsel:', err);
    }
  };

  const handleUpload = async (type: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/vorgaenge/${id}/upload/${type}`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        loadVorgang();
        alert(`${type.toUpperCase()} erfolgreich hochgeladen`);
      } else {
        alert('Fehler beim Hochladen');
      }
    } catch (err) {
      console.error('Upload Fehler:', err);
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
        <div>
          <strong>Status:</strong>{' '}
          {['angelegt', 'ausfuhr_beantragt'].includes(vorgang.status) ? (
            <span
              className="cursor-pointer hover:text-blue-600"
              onClick={toggleStatus}
              title="Klicken, um Status zu wechseln"
            >
              {vorgang.status === 'angelegt' ? '🫨 Angelegt' : '🤞🏻 Ausfuhr beantragt'}
            </span>
          ) : (
            <span>
              {vorgang.status === 'abd_erhalten' && '🥳 ABD erhalten'}
              {vorgang.status === 'agv_vorliegend' && '✅ AGV liegt vor'}
            </span>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold mt-6 mb-2">Dokumente</h2>
      <div className="flex gap-4 text-xl items-center">
        {vorgang.hasPdf && <a href={`${API_BASE_URL}/uploads/${vorgang.id}/pdf.pdf`} target="_blank" title="PDF herunterladen">📄</a>}
        {vorgang.hasInvoice && <a href={`${API_BASE_URL}/uploads/${vorgang.id}/rechnung.pdf`} target="_blank" title="Rechnung herunterladen">📄</a>}
        {vorgang.hasAbd && <a href={`${API_BASE_URL}/uploads/${vorgang.id}/abd.pdf`} target="_blank" title="ABD herunterladen">📄</a>}
        {vorgang.hasAgv && <a href={`${API_BASE_URL}/uploads/${vorgang.id}/agv.pdf`} target="_blank" title="AGV herunterladen">📄</a>}
      </div>

      <h2 className="text-xl font-bold mt-6 mb-2">Dokument hochladen</h2>
      <div className="space-y-2">
        <input type="file" onChange={(e) => e.target.files && handleUpload('rechnung', e.target.files[0])} title="Rechnung hochladen" />
        <input type="file" onChange={(e) => e.target.files && handleUpload('abd', e.target.files[0])} title="ABD hochladen" />
        <input type="file" onChange={(e) => e.target.files && handleUpload('agv', e.target.files[0])} title="AGV hochladen" />
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => navigate('/verwaltung')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Zurück
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