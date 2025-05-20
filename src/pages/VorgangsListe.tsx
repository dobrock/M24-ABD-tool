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
  
  const [editingMrnId, setEditingMrnId] = useState<string | null>(null);
  const [tempMrn, setTempMrn] = useState<string>('');

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
    const newStatus = vorgang.status === 'angelegt' ? 'ausfuhr_beantragt' : 'angelegt';
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

  const updateMrn = async (id: string, newMrn: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mrn: newMrn }),
      });
      setEditingMrnId(null);
      loadVorgaenge();
    } catch (err) {
      console.error('Fehler beim Aktualisieren der MRN:', err);
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
    <div className="min-h-screen bg-gray-50 pt-4 pb-12 px-4 sm:px-6 lg:px-8">
<h1 className="text-2xl font-bold text-gray-800 mb-6 max-w-4xl mx-auto pl-10">
  Vorgangsübersicht
</h1>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        {vorgaenge.length === 0 ? (
          <p>Keine Vorgänge vorhanden.</p>
        ) : (
          <table className="min-w-full bg-white table-fixed">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="w-80 text-left px-4 py-2 text-sm">Empfänger</th>
                <th className="w-24 text-left px-4 py-2 text-sm">Land</th>
                <th className="w-40 text-left px-4 py-2 text-sm">MRN</th>
                <th className="w-32 text-left px-4 py-2 text-sm">Erstellt am</th>
                <th className="w-55 text-left px-4 py-2 text-sm">Status</th>
                <th className="w-12 text-center px-4 py-2 text-sm">Dokumente</th>
                <th className="w-20 text-center px-4 py-2 text-sm">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {vorgaenge.map((vorgang) => (
                <tr key={vorgang.id} className="border-b">
                  <td className="px-4 py-2 text-sm">{vorgang.empfaenger}</td>
                  <td className="px-4 py-2 text-sm text-center" title={vorgang.land}>
                    {vorgang.land.length === 2 ? vorgang.land.toUpperCase() : vorgang.land === 'USA' ? 'US' : vorgang.land === 'China' ? 'CN' : vorgang.land === 'Japan' ? 'JP' : vorgang.land.slice(0, 2).toUpperCase()}
                  </td>
                  <td className="px-4 py-2 text-sm">
  {editingMrnId === vorgang.id ? (
    <input
      type="text"
      value={tempMrn}
      autoFocus
      onChange={(e) => setTempMrn(e.target.value)}
      onBlur={() => updateMrn(vorgang.id, tempMrn)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') updateMrn(vorgang.id, tempMrn);
        if (e.key === 'Escape') setEditingMrnId(null);
      }}
      className="w-full border border-gray-300 px-2 py-1 text-sm"
    />
  ) : (
<span
  className={`cursor-pointer ${vorgang.mrn ? '' : 'text-gray-200'} hover:underline`}
  title="MRN folgt"
  onClick={() => {
    setEditingMrnId(vorgang.id);
    setTempMrn(vorgang.mrn || '');
  }}
>
  {vorgang.mrn || '—'}
</span>
  )}
</td>
                  <td className="px-4 py-2 text-sm whitespace-nowrap">{new Date(vorgang.erstelldatum).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-sm">
                    {['angelegt', 'ausfuhr_beantragt'].includes(vorgang.status) ? (
                      <span
                      className="cursor-pointer hover:text-blue-600 whitespace-nowrap"
                      onClick={() => toggleStatus(vorgang)}
                      title="Klicken, um Status zu wechseln"
                    >
                        {statusIcons[vorgang.status]} {statusLabels[vorgang.status]}
                      </span>
                    ) : (
                      <span>{statusIcons[vorgang.status]} {statusLabels[vorgang.status]}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 w-12 text-center text-lg transition-colors duration-150 whitespace-nowrap">
                    {/* 1. Atlas PDF */}
                    <a
                      href={`${API_BASE_URL}/api/vorgaenge/${vorgang.id}/download/pdf`}
                      title="Daten für die Ausfuhr herunterladen"
                      className="mr-2 hover:text-blue-600"
                    >
                      <img
                        src="/icons/dokument-100.png"
                        className="inline h-[20px] hover:scale-110 transition-transform duration-150 hover:content-[url('/icons/dokument-100.png')]"
                        alt="Atlas PDF"
                      />
                    </a>

                    {/* 2. Handelsrechnung */}
                    {vorgang.hasInvoice ? (
                      <a
                        href={`${API_BASE_URL}/api/vorgaenge/${vorgang.id}/download/rechnung`}
                        title="Handelsrechnung herunterladen"
                        className="mr-2 hover:text-blue-600"
                      >
                        <img
                          src="/icons/dokument-25.png"
                          className="inline h-[20px] cursor-pointer hover:scale-110 transition-transform duration-150 hover:content-[url('/icons/dokument-100.png')]"
                          alt="Rechnung"
                        />
                      </a>
                    ) : (
                      <span className="mr-2" title="Keine Rechnung vorhanden">
                        <img
                          src="/icons/sanduhr-leer-25.png"
                          className="inline h-[20px] hover:scale-110 transition-transform duration-150 hover:content-[url('/icons/sanduhr-leer-100.png')]"
                          alt="Keine Rechnung"
                        />
                      </span>
                    )}

                    {/* 3. ABD/AGV */}
                    {vorgang.hasAgv ? (
                      <a
                        href={`${API_BASE_URL}/api/vorgaenge/${vorgang.id}/download/agv`}
                        title="Ausgangsvermerk herunterladen"
                        className="hover:text-blue-600"
                      >
                        <img
                          src="/icons/dokument-25.png"
                          className="inline h-[20px] cursor-pointer hover:scale-110 transition-transform duration-150 hover:content-[url('/icons/dokument-100.png')]"
                          alt="AGV"
                        />
                      </a>
                    ) : vorgang.hasAbd ? (
                      <a
                        href={`${API_BASE_URL}/api/vorgaenge/${vorgang.id}/download/abd`}
                        title="Ausfuhrbegleitdokument herunterladen"
                        className="hover:text-blue-600"
                      >
                        <img
                          src="/icons/dokument-25.png"
                          className="inline h-[20px] cursor-pointer hover:scale-110 transition-transform duration-150 hover:content-[url('/icons/dokument-100.png')]"
                          alt="ABD"
                        />
                      </a>
                    ) : (
                      <span title="Kein ABD vorhanden">
                        <img
                          src="/icons/sanduhr-voll-25.png"
                          className="inline h-[20px] hover:scale-110 transition-transform duration-150 hover:content-[url('/icons/sanduhr-voll-100.png')]"
                          alt="Kein ABD"
                        />
                      </span>
                    )}
                  </td>
  <td className="px-4 py-2 text-center text-sm">
    <div className="flex justify-center items-center gap-1 text-xs transition-colors duration-150">
      <img
        src={`/icons/stift-bunt-50.png`}
        onMouseEnter={(e) => (e.currentTarget.src = '/icons/stift-bunt-100.png')}
        onMouseLeave={(e) => (e.currentTarget.src = '/icons/stift-bunt-50.png')}
        className="h-[18px] cursor-pointer transition-transform duration-150 hover:scale-110"
        alt="Bearbeiten"
        title="Bearbeiten"
        onClick={() => navigate(`/vorgaenge/${vorgang.id}`)}
      />
      <img
        src={`/icons/kreuz-rot-50.png`}
        onMouseEnter={(e) => (e.currentTarget.src = '/icons/kreuz-rot-100.png')}
        onMouseLeave={(e) => (e.currentTarget.src = '/icons/kreuz-rot-50.png')}
        className="h-[18px] cursor-pointer transition-transform duration-150 hover:scale-110"
        alt="Löschen"
        title="Löschen"
        onClick={() => handleDelete(vorgang.id)}
      />
      <img
        src={`/icons/haken-gruen-50.png`}
        onMouseEnter={(e) => (e.currentTarget.src = '/icons/haken-gruen-100.png')}
        onMouseLeave={(e) => (e.currentTarget.src = '/icons/haken-gruen-50.png')}
        className="h-[18px] cursor-pointer transition-transform duration-150 hover:scale-110"
        alt="Archivieren"
        title="Archivieren"
        onClick={() => {
          if (window.confirm('Vorgang als erledigt archivieren?')) {
            alert('✅ Vorgang archiviert (Platzhalter)');
          }
        }}
      />
    </div>
  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}