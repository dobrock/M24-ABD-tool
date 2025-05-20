import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Dialog from '@radix-ui/react-dialog';

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
                <th className="text-left px-4 py-2 text-sm whitespace-nowrap">Erstellt am</th>
                <th className="w-55 text-left px-4 py-2 text-sm">Status</th>
                <th className="w-12 text-center px-4 py-2 text-sm">Dokumente</th>
                <th className="w-20 text-center px-4 py-2 text-sm">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {vorgaenge.map((vorgang) => (
                <tr key={vorgang.id} className="border-b">
                  <td className="px-4 py-2 text-sm">{vorgang.empfaenger}</td>
                  <td className="px-4 py-2 text-sm text-center align-middle tracking-wider leading-relaxed">
                    <Tooltip.Provider delayDuration={200}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <span className="inline-block w-full text-center">
                            {vorgang.land.length === 2
                              ? vorgang.land.toUpperCase()
                              : vorgang.land === 'USA'
                              ? 'US'
                              : vorgang.land === 'China'
                              ? 'CN'
                              : vorgang.land === 'Japan'
                              ? 'JP'
                              : vorgang.land.slice(0, 2).toUpperCase()}
                          </span>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
                            sideOffset={5}
                          >
                            {vorgang.land}
                            <Tooltip.Arrow className="fill-gray-300" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
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
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span
            className={`cursor-pointer ${vorgang.mrn ? 'truncate max-w-[160px] inline-block align-middle' : 'text-gray-200'}`}
            onClick={() => {
              setEditingMrnId(vorgang.id);
              setTempMrn(vorgang.mrn || '');
            }}
          >
            {vorgang.mrn || '—'}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
            sideOffset={5}
          >
            {vorgang.mrn || 'MRN folgt'}
            <Tooltip.Arrow className="fill-gray-300" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
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
                    <Tooltip.Provider delayDuration={200}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <a
                            href={`${API_BASE_URL}/api/vorgaenge/${vorgang.id}/download/pdf`}
                            className="mr-2 hover:text-blue-600"
                          >
                            <img
                              src="/icons/dokument-100.png"
                              className="inline h-[16px] hover:scale-110 transition-transform duration-150"
                              alt="Atlas PDF"
                            />
                          </a>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
                            sideOffset={5}
                          >
                            Daten für die Ausfuhr herunterladen
                            <Tooltip.Arrow className="fill-black" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>

                    {/* 2. Handelsrechnung */}
                    {vorgang.hasInvoice ? (
                      <a
                        href={`${API_BASE_URL}/api/vorgaenge/${vorgang.id}/download/rechnung`}
                        title="Handelsrechnung herunterladen"
                        className="mr-2 hover:text-blue-600"
                      >
                        <img
                          src="/icons/dokument-25.png"
                          className="inline h-[16px] cursor-pointer hover:scale-110 transition-transform duration-150 hover:content-[url('/icons/dokument-100.png')]"
                          alt="Rechnung"
                        />
                      </a>
                    ) : (
                      <Tooltip.Provider delayDuration={200}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <span className="mr-2 cursor-default">
                              <img
                                src="/icons/sanduhr-leer-25.png"
                                className="inline h-[16px] hover:scale-110 transition-transform duration-150 hover:content-[url('/icons/sanduhr-leer-100.png')]"
                                alt="Keine Rechnung"
                              />
                            </span>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
                              sideOffset={5}
                            >
                              Keine Rechnung hochgeladen
                              <Tooltip.Arrow className="fill-gray-300" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
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
                          className="inline h-[16px] cursor-pointer hover:scale-110 transition-transform duration-150 hover:content-[url('/icons/dokument-100.png')]"
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
                          className="inline h-[16px] cursor-pointer hover:scale-110 transition-transform duration-150 hover:content-[url('/icons/dokument-100.png')]"
                          alt="ABD"
                        />
                      </a>
                    ) : (
                      <Tooltip.Provider delayDuration={200}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <span className="cursor-default">
                              <img
                                src="/icons/sanduhr-voll-25.png"
                                className="inline h-[16px] hover:scale-110 transition-transform duration-150 hover:content-[url('/icons/sanduhr-voll-100.png')]"
                                alt="Kein ABD"
                              />
                            </span>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
                              sideOffset={5}
                            >
                              Es wurde noch kein ABD erstellt
                              <Tooltip.Arrow className="fill-gray-300" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    )}
                  </td>
  <td className="px-4 py-2 text-center text-sm">
    <div className="flex justify-center items-center gap-1 text-xs transition-colors duration-150">

      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <img
              src={`/icons/stift-bunt-50.png`}
              onMouseEnter={(e) => (e.currentTarget.src = '/icons/stift-bunt-100.png')}
              onMouseLeave={(e) => (e.currentTarget.src = '/icons/stift-bunt-50.png')}
              className="h-[16px] cursor-pointer transition-transform duration-150 hover:scale-110"
              alt="Bearbeiten"
              onClick={() => navigate(`/vorgaenge/${vorgang.id}`)}
            />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
              sideOffset={5}
            >
              Vorgang bearbeiten
              <Tooltip.Arrow className="fill-gray-300" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      <Dialog.Root>
        <Dialog.Trigger asChild>
          <img
            src="/icons/kreuz-rot-50.png"
            onMouseEnter={(e) => (e.currentTarget.src = '/icons/kreuz-rot-100.png')}
            onMouseLeave={(e) => (e.currentTarget.src = '/icons/kreuz-rot-50.png')}
            className="h-[16px] cursor-pointer transition-transform duration-150 hover:scale-110"
            alt="Löschen"
          />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-lg shadow-xl p-6 z-50 max-w-sm w-full">
            <Dialog.Title className="text-base font-medium mb-3">Vorgang löschen?</Dialog.Title>
            <p className="text-sm text-gray-600 mb-4">Möchtest du diesen Vorgang wirklich dauerhaft löschen?</p>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">Abbrechen</button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <button
                  onClick={() => handleDelete(vorgang.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Löschen
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <img
              src={`/icons/haken-gruen-50.png`}
              onMouseEnter={(e) => (e.currentTarget.src = '/icons/haken-gruen-100.png')}
              onMouseLeave={(e) => (e.currentTarget.src = '/icons/haken-gruen-50.png')}
              className="h-[16px] cursor-pointer transition-transform duration-150 hover:scale-110"
              alt="Archivieren"
              onClick={() => {
                if (window.confirm('Vorgang als erledigt archivieren?')) {
                  alert('✅ Vorgang archiviert (Platzhalter)');
                }
              }}
            />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
              sideOffset={5}
            >
              Vorgang erledigt (wird archiviert)
              <Tooltip.Arrow className="fill-gray-300" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

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