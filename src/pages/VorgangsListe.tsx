import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'react-hot-toast';
import { getFileUrl } from '@/lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const getUploadUrl = (uploads: any[], typ: string) => {
  const eintrag = uploads.find(file =>
    file.typ?.toLowerCase().includes(typ.toLowerCase())
  );
  return eintrag?.url || null;
};

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
  uploads?: any[];
  formdata?: any;
}

// Icon + Tooltip + optionaler Link für ein bestimmtes Dokument
const renderDokumentIcon = (
  uploads: any[],
  typ: string,
  fallbackIcon: string,
  label: string
) => {
  const url = getUploadUrl(uploads ?? [], typ);
  const iconPath = url ? "/icons/dokument-25.png" : fallbackIcon;

  return (
    <Tooltip.Provider delayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={() => url && window.open(url, '_blank')}
            disabled={!url}
            className="hover:scale-110 transition-transform"
          >
            <img
              src={iconPath}
              className={`h-[16px] ${!url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              alt={label}
            />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
            sideOffset={5}
          >
            {url ? `${label} herunterladen` : `Warten auf ${label}`}
            <Tooltip.Arrow className="fill-gray-300" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default function VorgangsListe() {
  const [vorgaenge, setVorgaenge] = useState<Vorgang[]>([]);
  useEffect(() => {
    console.log("📦 Vorgänge mit Uploads:", vorgaenge);
  }, [vorgaenge]);
  
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
      const res = await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, {
        method: 'DELETE',
      });
  
      if (res.ok) {
        toast.success('Vorgang wurde gelöscht');
        loadVorgaenge(); // Daten neu laden
      } else {
        toast.error('Löschen fehlgeschlagen');
      }
    } catch (err) {
      console.error('❌ Fehler beim Löschen:', err);
      toast.error('Serverfehler beim Löschen');
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <th className="w-48 text-left px-4 py-2 text-sm">Status</th>
                <th className="w-12 text-center px-4 py-2 text-sm">Dokumente</th>
                <th className="w-20 text-center px-4 py-2 text-sm">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {vorgaenge.map((vorgang) => (
                <tr key={vorgang.id} className="border-b">
                 <td className="px-4 py-2 text-sm whitespace-nowrap">
                    {vorgang.formdata?.recipient?.name || '—'}
                  </td>
                  <td className="px-4 py-2 text-sm text-center align-middle tracking-wider leading-relaxed">
                <Tooltip.Provider delayDuration={200}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <span className="inline-block w-full text-center">
                        {(() => {
                          const land = vorgang.formdata?.recipient?.country || '';
                          if (land.length === 2) return land.toUpperCase();
                          if (land === 'USA') return 'US';
                          if (land === 'China') return 'CN';
                          if (land === 'Japan') return 'JP';
                          return land.slice(0, 2).toUpperCase();
                        })()}
                      </span>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
                        sideOffset={5}
                      >
                        {vorgang.formdata?.recipient?.country || 'Unbekannt'}
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
                  <td className="px-4 py-2 text-sm w-48 whitespace-nowrap">
                    {['abd_erhalten', 'agv_vorliegend'].includes(vorgang.status) ? (
                      <span className="text-gray-600">
                        {statusIcons[vorgang.status]} {statusLabels[vorgang.status]}
                      </span>
                    ) : (
                      <Tooltip.Provider delayDuration={150}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <span
                              className="cursor-pointer hover:text-blue-600 transition"
                              onClick={() => toggleStatus(vorgang)}
                            >
                              {statusIcons[vorgang.status]} {statusLabels[vorgang.status]}
                            </span>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="bg-white border text-black px-3 py-1.5 rounded shadow text-sm"
                              sideOffset={5}
                            >
                              Klicken zum Statuswechsel
                              <Tooltip.Arrow className="fill-white" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    )}
                  </td>

                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    <div className="flex gap-1 justify-center">
                    {renderDokumentIcon(vorgang.uploads, "pdf", "/icons/sanduhr-leer-25.png", "Atlas-Eingabedaten")}
                    {renderDokumentIcon(vorgang.uploads, "rechnung", "/icons/sanduhr-leer-25.png", "Handelsrechnung")}
                    {renderDokumentIcon(vorgang.uploads, "ausfuhrbegleitdokument", "/icons/sanduhr-voll-25.png", "ABD")}
{renderDokumentIcon(vorgang.uploads, "ausgangsvermerk", "/icons/sanduhr-voll-25.png", "AGV")}

                    </div>
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
                              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded border text-sm">Abbrechen</button>
                            </Dialog.Close>
                            <Dialog.Close asChild>
                              <button
                                onClick={() => handleDelete(vorgang.id)}
                                className="bg-white hover:bg-red-100 text-red-600 px-4 py-2 rounded border border-red-300 text-sm"
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