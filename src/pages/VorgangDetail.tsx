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
            className="cursor-pointer hover:text-blue-600 text-base"
            onClick={() => updateStatus('ausfuhr_beantragt')}
            title="Klicken, um zu 'Ausfuhr beantragt' zu wechseln"
          >
            🫨 angelegt
          </span>
        );
      case 'ausfuhr_beantragt':
        return (
          <span
            className="cursor-pointer hover:text-blue-600 text-base"
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

      {/*
      Datenbank Eintrag kompllett sichtbar machen
      */}

      {/*
      <div className="bg-gray-100 border rounded p-4 mb-6 overflow-auto">
        <h3 className="text-sm font-semibold mb-2">📦 Vollständiger Vorgangsdatensatz (Rohdaten)</h3>
        <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(vorgang, null, 2)}
        </pre>
      </div>
      */}

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">

        <div className="flex justify-between items-center mb-4 px-6">
        <div className="text-lg font-semibold text-gray-800">
           MOTORSPORT24-GmbH_{new Date(vorgang.erstelldatum).toISOString().slice(2, 10).replace(/-/g, '-')}_{vorgang.formdata?.invoiceNumber || '–'}
        </div>

          <div className="font-medium text-gray-800 text-base">
            <strong>Status:</strong> {statusDarstellung(vorgang.status)}
          </div>
        </div>

        <div className="bg-gray-100 text-gray-800 rounded-t-xl px-6 py-3 grid grid-cols-3 text-sm font-semibold">
          <div>Ausführer</div>
          <div>Empfänger</div>
          <div>Empfängerland</div>
        </div>
        <div className="grid grid-cols-3 px-6 py-3 border-b border-gray-100 text-sm">
          <div>MOTORSPORT24 GmbH</div>
          <div>{vorgang.formdata?.recipient?.name || '–'}</div>
          <div>{vorgang.formdata?.recipient?.country || '–'}</div>
        </div>


        {/* 
         🚧 Temporär deaktiviert: erste Artikel-Kurzübersicht 
        Grund: formdata.items[] wird dynamisch unten korrekt dargestellt 
        */}

        {/* 
        <div className="bg-gray-100 text-gray-800 px-6 py-3 grid grid-cols-10 text-sm font-semibold mt-6">
          <div className="col-span-5">Warenbezeichnung</div>
          <div className="col-span-2">Tarifnummer</div>
          <div className="col-span-1">Gewicht</div>
          <div className="col-span-2">Warenwert</div>
        </div>
        <div className="px-6 py-2 grid grid-cols-10 border-b border-gray-100 text-sm">
          <div className="col-span-5">{vorgang.formdata?.items?.[0]?.description || '–'}          </div>
          <div className="col-span-2">{vorgang.items?.[0]?.tariff || '–'}</div>
          <div className="col-span-1">{vorgang.items?.[0]?.weight || '–'} kg</div>
          <div className="col-span-2">{vorgang.items?.[0]?.value || '–'} €</div>
        </div>
        */}

        <div className="bg-gray-100 text-gray-800 px-6 py-3 text-sm cursor-pointer select-none rounded-b-xl mt-6" onClick={() => setShowDetails(!showDetails)}>
          + weitere Daten ansehen
        </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 px-6 pt-4 pb-6 font-semibold">
            <div><strong>Rechnungsnummer:</strong> {vorgang.formdata?.invoiceNumber || '–'}</div>
            <div><strong>Rechnungsbetrag:</strong> {Number(vorgang.formdata?.invoiceTotal || 0).toLocaleString('de-DE')} €
            </div>
            <div><strong>Beladeort:</strong> {vorgang.formdata?.loadingPlace || '–'}</div>
            <div><strong>Versandweg:</strong> {vorgang.formdata?.shippingMethod || '–'}</div>
            <div><strong>Empfängeradresse:</strong> {vorgang.formdata?.recipient?.street || '–'}, {vorgang.formdata?.recipient?.zip || ''} {vorgang.formdata?.recipient?.city || ''}</div>
            <div><strong>Empfängerland:</strong> {vorgang.formdata?.recipient?.country || '–'}</div>
          </div>
        </div>

        <div className="mt-6 mb-6 px-6">
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
            className="flex items-end gap-3"
          >
            <div className="relative w-1/3">
              <label
                htmlFor="mrn"
                className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 z-10"
              >
                MRN (Movement Reference Number)
              </label>
              <input
                type="text"
                name="mrn"
                id="mrn"
                defaultValue={vorgang.mrn}
                placeholder="z. B. 21DE12345678912345"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md shadow hover:from-blue-600 hover:to-blue-700 transition"
              title="MRN speichern"
            >
              💾
            </button>
          </form>
        </div>

        <div className="mb-6">
  {Array.isArray(vorgang.formdata?.items) && vorgang.formdata.items.length > 0 ? (
    <>
      <div className="bg-gray-100 text-gray-800 px-6 py-3 grid grid-cols-11 text-sm font-semibold rounded-t-xl">
        <div className="col-span-6">Warenbezeichnung</div>
        <div className="col-span-3">Tarifnummer</div>
        <div className="col-span-1 text-center">Gewicht</div>
        <div className="col-span-1 text-center">Wert</div>
      </div>

      {vorgang.formdata.items.map((item, index) => (
        <div key={index} className="grid grid-cols-11 gap-2 px-6 py-2 border-b border-gray-100 text-sm">
          <div className="col-span-6">{item.description || '–'}</div>
          <div className="col-span-3">{item.tariff || '–'}</div>
          <div className="col-span-1 text-center">{item.weight || '–'} kg</div>
          <div className="col-span-1 text-center">{Number(item.value || 0).toLocaleString('de-DE')} €
          </div>
        </div>
      ))}

      {/* Abstand unter der Tabelle */}
      <div className="px-6" />
          </>
        ) : (
          <p className="text-gray-500 px-6 py-4">Keine Positionen vorhanden.</p>
        )}
      </div>

      <div className="mb-6 px-6">
        <div className="flex flex-row justify-between items-end flex-wrap">
          
          {/* 2/3: Eingabebereich links */}
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
            className="w-2/3 space-y-2"
          >
            {/* Überschrift */}        
            <p className="text-base text-gray-800 font-bold px-1 mb-4">Dateiupload</p>

            {/* Eingabefelder */}
            <div className="flex items-end gap-3">
              {/* Auswahlfeld */}
              <div className="w-1/2">
                <select
                  name="label"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 h-[42px]"
                >
                  <option disabled selected value="">Bitte auswählen</option>
                  <option>Handelsrechnung</option>
                  <option>Ausfuhrbegleitdokument</option>
                  <option>Ausgangsvermerk</option>
                </select>
              </div>

              {/* Dateiinputfeld */}
              <div className="relative w-1/2">
                <input
                  type="file"
                  name="file"
                  id="file"
                  className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md px-3 py-2 pr-10 cursor-pointer file:cursor-pointer file:border-0 file:bg-white file:text-gray-500 h-[42px]"
                />
                <div className="absolute right-2 top-2.5 text-gray-400 pointer-events-none">
                  📁
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md shadow hover:from-blue-600 hover:to-blue-700 transition"
                title="Datei speichern"
              >
                💾
              </button>
            </div>
            </form>

          {/* 1/3: Iconbereich rechts */}
          <div className="w-1/3">
           <div className="text-center mb-1">
              <p className="text-base text-gray-800 font-bold mb-4">Vorgangs-Dateien</p>
            </div>
            <div className="flex justify-center items-center gap-4 pt-2">

            {/* Atlas-PDF */}
            <button
              title="Atlas Eingabedaten herunterladen"
              disabled={!vorgang.files?.pdf}
              onClick={() => window.open(vorgang.files.pdf, '_blank')}
              className="hover:scale-105 transition transform"
            >
              <img
                src="/src/pages/icons/dokument-50.png"
                className={`h-8 ${!vorgang.files?.pdf ? "opacity-25 cursor-not-allowed" : ""}`}
              />
            </button>

            {/* Handelsrechnung */}
            <button
              title={vorgang.files?.invoice ? "Handelsrechnung herunterladen" : "bitte Handelsrechnung hochladen"}
              disabled={!vorgang.files?.invoice}
              onClick={() => window.open(vorgang.files.invoice, '_blank')}
              className="hover:scale-105 transition transform"
            >
              <img
                src={vorgang.files?.invoice ? "/src/pages/icons/dokument-50.png" : "/icons/dokument-25.png"}
                className={`h-8 ${!vorgang.files?.invoice ? "opacity-25 cursor-not-allowed" : ""}`}
              />
            </button>

            {/* ABD */}
            <button
              title={vorgang.files?.abd ? "Ausfuhrbegleitdokument herunterladen" : "Warten auf ABD"}
              disabled={!vorgang.files?.abd}
              onClick={() => window.open(vorgang.files.abd, '_blank')}
              className="hover:scale-105 transition transform"
            >
              <img
                src={vorgang.files?.abd ? "/src/pages/icons/dokument-50.png" : "/icons/sanduhr-leer-50.png"}
                className={`h-8 ${!vorgang.files?.abd ? "opacity-25 cursor-not-allowed" : ""}`}
              />
            </button>

            {/* AGV */}
            <button
              title={vorgang.files?.agv ? "Ausgangsvermerk herunterladen" : "Warten auf AGV"}
              disabled={!vorgang.files?.agv}
              onClick={() => window.open(vorgang.files.agv, '_blank')}
              className="hover:scale-105 transition transform"
            >
              <img
                src={vorgang.files?.agv ? "/src/pages/icons/dokument-50.png" : "/icons/sanduhr-voll-50.png"}
                className={`h-8 ${!vorgang.files?.agv ? "opacity-25 cursor-not-allowed" : ""}`}
              />
            </button>

          </div>

        </div>

        </div>
      </div>


        {vorgang.notizen && (
          <div className="px-6 mb-6">
            <strong>Notizen:</strong> {vorgang.notizen}
          </div>
        )}

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