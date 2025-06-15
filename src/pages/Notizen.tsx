import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://m24-abd-api-backend.onrender.com';

type Notiz = {
  id: string;
  titel: string;
  beschreibung: string;
  erstellt_am?: string;
};

export default function Notizen() {
  const [notizen, setNotizen] = useState<Notiz[]>([]);
  const [titel, setTitel] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [bearbeiteId, setBearbeiteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotizen();
  }, []);

  const fetchNotizen = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notizen`);
      const data = await res.json();
      setNotizen(data);
    } catch {
      toast.error('Fehler beim Laden der Notizen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titel || !beschreibung) return toast.error('Bitte Titel und Beschreibung angeben');

    setIsSubmitting(true);

    const method = bearbeiteId ? 'PATCH' : 'POST';
    const url = bearbeiteId
      ? `${API_BASE_URL}/api/notizen/${bearbeiteId}`
      : `${API_BASE_URL}/api/notizen`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titel, beschreibung }),
      });
      if (!res.ok) throw new Error('Fehler beim Speichern');
      setTitel('');
      setBeschreibung('');
      setBearbeiteId(null);
      setIsSuccess(true);
      fetchNotizen();
      setTimeout(() => setIsSuccess(false), 2000);
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (notiz: Notiz) => {
    setTitel(notiz.titel);
    setBeschreibung(notiz.beschreibung);
    setBearbeiteId(notiz.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Willst du diese Notiz wirklich löschen?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notizen/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Fehler beim Löschen');
      toast.success('Notiz gelöscht');
      fetchNotizen();
    } catch {
      toast.error('Löschen fehlgeschlagen');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        Update-Notizen
      </h1>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="mb-10 space-y-4">
          <input
            type="text"
            placeholder="Titel"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
          />
          <textarea
            placeholder="Beschreibung"
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
                ? '⏳ Wird gespeichert...'
                : isSuccess
                ? '✅ Notiz gespeichert'
                : bearbeiteId
                ? 'Bearbeitung speichern'
                : 'Neue Notiz speichern'}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notizen.map((notiz) => (
            <div
              key={notiz.id}
              className="relative bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
              onMouseEnter={() => setHoveredId(notiz.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative z-10">
                <h2 className="text-base font-semibold text-gray-900 truncate">{notiz.titel}</h2>
                <p className="text-sm text-gray-700 line-clamp-3 overflow-hidden text-ellipsis">
                  {notiz.beschreibung}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-400 mt-3">
                  <div>
                    Erstellt am:&nbsp;
                    {notiz.erstellt_am
                      ? new Date(notiz.erstellt_am).toLocaleDateString()
                      : ''}
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => handleEdit(notiz)} title="Bearbeiten">
                      <img
                        src="/icons/stift-100.png"
                        alt="Bearbeiten"
                        className="w-5 h-5 hover:scale-110 transition"
                      />
                    </button>
                    <button onClick={() => handleDelete(notiz.id)} title="Löschen">
                      <img
                        src="/icons/kreuz-rot-100.png"
                        alt="Löschen"
                        className="w-5 h-5 hover:scale-110 transition"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {hoveredId === notiz.id && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-80 bg-white border border-gray-300 shadow-xl rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap transition-opacity duration-300 opacity-100"
                  onMouseEnter={() => setHoveredId(notiz.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="font-semibold mb-1">{notiz.titel}</div>
                  <div>{notiz.beschreibung}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
