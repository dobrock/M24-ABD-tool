import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://m24-abd-api-backend.onrender.com';

type ProtokollEintrag = {
  id: string;
  version: string;
  beschreibung: string;
  erstellt_am?: string;
};

export default function VersionsProtokoll() {
  const [eintraege, setEintraege] = useState<ProtokollEintrag[]>([]);
  const [version, setVersion] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [bearbeiteId, setBearbeiteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Versionsprotokoll | M24 ABD-Tool';
    fetchProtokoll();
  }, []);

  const fetchProtokoll = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/protokoll`);
      const data = await res.json();
      setEintraege(data);
    } catch {
      toast.error('Fehler beim Laden der Einträge');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version || !beschreibung) return toast.error('Bitte Version und Beschreibung angeben');

    setIsSubmitting(true);

    const method = bearbeiteId ? 'PATCH' : 'POST';
    const url = bearbeiteId
      ? `${API_BASE_URL}/api/protokoll/${bearbeiteId}`
      : `${API_BASE_URL}/api/protokoll`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version, beschreibung }),
      });
      if (!res.ok) throw new Error('Fehler beim Speichern');
      setVersion('');
      setBeschreibung('');
      setBearbeiteId(null);
      setIsSuccess(true);
      fetchProtokoll();
      setTimeout(() => setIsSuccess(false), 2000);
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (eintrag: ProtokollEintrag) => {
    setVersion(eintrag.version);
    setBeschreibung(eintrag.beschreibung);
    setBearbeiteId(eintrag.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eintrag wirklich löschen?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/protokoll/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Fehler beim Löschen');
      toast.success('Eintrag gelöscht');
      fetchProtokoll();
    } catch {
      toast.error('Löschen fehlgeschlagen');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        Versionsprotokoll
      </h1>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="mb-10 space-y-4">
          <input
            type="text"
            placeholder="Versionsnummer"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
          />
          <textarea
            placeholder="Änderungen (jede Zeile = eigener Punkt)"
            value={beschreibung}
            onChange={(e) => setBeschreibung(e.target.value)}
            className="w-full p-2 border rounded h-24 bg-gray-100 dark:bg-gray-700"
          />
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              } text-white font-semibold py-2 px-6 rounded shadow-md transition`}
            >
              {isSubmitting
                ? '⏳ wird gespeichert...'
                : isSuccess
                ? '✅ Eintrag gespeichert'
                : bearbeiteId
                ? 'Bearbeitung speichern'
                : 'Neuen Protokolleintrag speichern'}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {eintraege.map((entry) => (
            <div
              key={entry.id}
              className="relative p-4 bg-white dark:bg-gray-800 rounded shadow group"
            >
              <h2 className="text-lg font-semibold">{entry.version}</h2>
              <p className="text-sm text-gray-500 mb-2">
                Erstellt am: {new Date(entry.erstellt_am || '').toLocaleDateString('de-DE')}
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {entry.beschreibung
                  .split('\n')
                  .filter((line) => line.trim() !== '')
                  .map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
              </ul>

              <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(entry)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Bearbeiten"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Löschen"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
