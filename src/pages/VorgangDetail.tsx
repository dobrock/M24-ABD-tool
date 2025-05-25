import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function VorgangDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vorgang, setVorgang] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const loadVorgang = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`);
      if (res.ok) {
        const data = await res.json();
        console.log('📦 Daten vom Server:', data);
        console.log("📦 Full Vorgang:", data);
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

  if (!vorgang) return <p>Vorgang wird geladen...</p>;

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        Vorgang Zusammenfassung
      </h1>

      <div className="bg-gray-100 border rounded p-4 mb-6 overflow-auto">
  <h3 className="text-sm font-semibold mb-2">📦 Vollständiger Vorgangsdatensatz (Rohdaten)</h3>
  <pre className="text-xs whitespace-pre-wrap">
    {JSON.stringify(vorgang, null, 2)}
  </pre>
</div>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">

        <div className="flex justify-between items-center mb-4 px-6">
          <div className="text-lg font-semibold text-gray-800">
            MOTORSPORT24-GmbH_{new Date(vorgang.erstelldatum).toISOString().slice(2, 10).replace(/-/g, '-')}_{vorgang.invoiceNumber || '–'}
          </div>
          <div className="text-sm font-medium text-gray-800">
            <strong>Status:</strong> {statusDarstellung(vorgang.status)}
          </div>
        </div>

        <div className="bg-gray-100 text-gray-800 rounded-t-xl px-6 py-3 grid grid-cols-3 text-sm font-semibold">
          <div>Ausführer</div>
          <div>Empfänger</div>
          <div>Empfängerland</div>
        </div>
        <div className="grid grid-cols-3 px-6 py-2 border-b border-gray-100 mt-6">
          <div>MOTORSPORT24 GmbH</div>
          <div>{vorgang.recipient?.name || '–'}</div>
          <div>{vorgang.recipient?.country || '–'}</div>
        </div>

        <div className="bg-gray-100 text-gray-800 px-6 py-3 grid grid-cols-10 text-sm font-semibold mt-6">
          <div className="col-span-5">Warenbezeichnung</div>
          <div className="col-span-2">Tarifnummer</div>
          <div className="col-span-1">Gewicht</div>
          <div className="col-span-2">Warenwert</div>
        </div>
        <div className="px-6 py-2 grid grid-cols-10 border-b border-gray-100 text-sm">
          <div className="col-span-5">{vorgang.items?.[0]?.description || '–'}</div>
          <div className="col-span-2">{vorgang.items?.[0]?.tariff || '–'}</div>
          <div className="col-span-1">{vorgang.items?.[0]?.weight || '–'} kg</div>
          <div className="col-span-2">{vorgang.items?.[0]?.value || '–'} €</div>
        </div>

        <div className="bg-gray-100 text-gray-800 px-6 py-3 text-sm cursor-pointer select-none rounded-b-xl mt-6" onClick={() => setShowDetails(!showDetails)}>
          + weitere Daten ansehen
        </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 px-6 pt-4 pb-6 font-semibold">
            <div><strong>Rechnungsnummer:</strong> {vorgang.invoiceNumber || '–'}</div>
            <div><strong>Rechnungsbetrag:</strong> {vorgang.invoiceTotal || '–'} €</div>
            <div><strong>Beladeort:</strong> {vorgang.loadingPlace || '–'}</div>
            <div><strong>Versandweg:</strong> {vorgang.shippingMethod || '–'}</div>
            <div><strong>Empfängeradresse:</strong> {vorgang.recipient?.street || '–'}, {vorgang.recipient?.zip || ''} {vorgang.recipient?.city || ''}</div>
            <div><strong>Empfängerland:</strong> {vorgang.recipient?.country || '–'}</div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 px-6 mt-6">MRN</label>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const mrn = formData.get('mrn');
              const res = await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mrn }),
              });
              if (res.ok) {
                loadVorgang();
              } else {
                alert('Fehler beim Speichern der MRN');
              }
            }}
            className="flex gap-2 mt-10 mb-8 px-6"
          >
            <input
              type="text"
              name="mrn"
              defaultValue={vorgang.mrn}
              className="w-1/2 border rounded px-3 py-2"
            />
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded shadow">
              💾
            </button>
          </form>
        </div>

        <div className="mb-6 px-6">
  <h4 className="text-sm font-semibold mb-2">Warenpositionen</h4>
  {Array.isArray(vorgang.items) && vorgang.items.length > 0 ? (
    vorgang.items.map((item, index) => (
      <div key={index} className="border p-3 mb-2 rounded bg-gray-50">
        <div><strong>{index + 1}. {item.description || '–'}</strong></div>
        <div>Tarifnummer: {item.tariff || '–'}</div>
        <div>Gewicht: {item.weight || '–'} kg</div>
        <div>Warenwert: {item.value || '–'} €</div>
      </div>
    ))
  ) : (
    <p className="text-gray-500">Keine Positionen vorhanden.</p>
  )}
</div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            if (!formData.get('file')) return alert('Bitte eine Datei auswählen');
            const res = await fetch(`${API_BASE_URL}/api/vorgaenge/${id}/upload/generic`, {
              method: 'POST',
              body: formData,
            });
            if (res.ok) {
              alert('Datei erfolgreich hochgeladen');
              loadVorgang();
            } else {
              alert('Fehler beim Hochladen');
            }
          }}
          className="flex items-end gap-4 mb-8 px-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Dateityp</label>
            <select name="label" className="border rounded px-2 py-2">
              <option disabled selected value="">Bitte auswählen</option>
              <option>Handelsrechnung</option>
              <option>Ausfuhrbegleitdokument</option>
              <option>Ausgangsvermerk</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <img src="/icons/ordner.png" className="h-6" />
              <span className="text-sm text-gray-700">Datei auswählen</span>
              <input type="file" name="file" className="hidden" />
            </label>
          </div>
          <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded shadow">
            💾
          </button>
          <div className="flex items-center justify-center gap-4 pt-4">
            <img src="/icons/dokument-100.png" className="h-8" />
            <img src="/icons/sanduhr-leer-25.png" className="h-8" />
            <img src="/icons/sanduhr-voll-25.png" className="h-8" />
          </div>
        </form>

        <div className="px-6 mb-6">
          <strong>Notizen:</strong> {vorgang.notizen || '–'}
        </div>

        <div className="flex gap-4 mt-8 justify-end px-6">
          <button
            onClick={handleDelete}
            className="bg-white hover:bg-red-100 text-red-600 px-4 py-2 rounded border border-red-300"
            title="Löschen"
          >
            ❌ Löschen
          </button>
          <button
            onClick={() => alert('✅ Vorgang archiviert')}
            className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded border border-green-300"
            title="Archivieren"
          >
            ✅ Archivieren
          </button>
        </div>
      </div>
    </div>
  );
}