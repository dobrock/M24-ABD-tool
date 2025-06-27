import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip'; // ✅ Nur dieser Import!
import { getFileUrl } from '@/lib/utils';
import { Mail, Send } from 'lucide-react';
import { generateEmailLink } from '@/components/generateEmailLink';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let uploads: any[] = [];

const getUploadUrl = (typ: string) => {
  const eintrag = uploads.find(file =>
    file.typ?.toLowerCase().includes(typ.toLowerCase())
  );
  return eintrag?.url || null;
};

const renderIcon = (typ: string, fallbackIcon: string, label: string) => {
  const url = getUploadUrl(typ);
  const iconPath = url ? "/icons/dokument-100.png" : fallbackIcon;

  return (
    <Tooltip.Provider delayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={() => url && window.open(url, '_blank')}
            disabled={!url}
            className="hover:scale-105 transition transform"
          >
            <img src={iconPath} className={`h-8 ${!url ? 'cursor-not-allowed opacity-25' : ''}`} />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content
          className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
          sideOffset={5}
        >
          {url ? `${label} herunterladen` : `Warten auf ${label}`}
          <Tooltip.Arrow className="fill-gray-300" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

const downloadFile = (url: string) => {
  const filename = url.split('/').pop() || 'download.pdf';
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function VorgangDetail() {
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [selectedLabel, setSelectedLabel] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const [vorgang, setVorgang] = useState<any>(null);
    useEffect(() => {
      if (vorgang) {
        console.log('📦 Full Vorgang:', vorgang);
        console.log('🧾 Upload-Dateien:', vorgang.uploads);
        console.log('🔍 Upload-Typen:', vorgang.uploads?.map(f => f.typ));
      }
    }, [vorgang]);
  const [showDetails, setShowDetails] = useState(false);
  const files = vorgang?.files || {};

  const handleDelete = async () => {
    if (!confirm('Diesen Vorgang wirklich löschen?')) return;
  
    try {
      await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, {
        method: 'DELETE',
      });
  
      toast.success('Vorgang wurde gelöscht');

      // PDF herunterladen
      downloadPDF(pdfBlob, `${fileName}.pdf`);
  
      // ✅ Korrekte Weiterleitung zur Übersicht mit Ersetzen im Verlauf
      navigate('/verwaltung', { replace: true });
    } catch (err) {
      console.error('❌ Fehler beim Löschen des Vorgangs:', err);
      toast.error('Löschen fehlgeschlagen');
    }
  };  

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
    console.log('🧪 Statuswert im Render:', JSON.stringify(status));
    status = status.trim(); // 🛠️ verhindert unsichtbare Fehler
  
    const statusMap = {
      'angelegt': '🫨 angelegt',
      'ausfuhr_beantragt': '🤞🏻 Ausfuhr beantragt',
      'abd_erhalten': '🥳 ABD erhalten',
      'agv_vorliegend': '✅ AGV liegt vor',
    };
  
    const istFixiert = ['abd_erhalten', 'agv_vorliegend'].includes(status);
  
    if (istFixiert) {
      return (
        <span className="text-base text-gray-600">
          {statusMap[status] || '❓ Unbekannt'}
        </span>
      );
    }
  
    return (
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <span
              className="text-base cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() =>
                updateStatus(
                  status === 'angelegt' ? 'ausfuhr_beantragt' : 'angelegt'
                )
              }
            >
              {statusMap[status] || '❓ Unbekannt'}
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content
            className="bg-white px-3 py-1.5 rounded shadow text-sm text-black"
            side="top"
          >
            Klicke auf den Status, um ihn zu ändern
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  };
  
  if (!vorgang) return <p>Vorgang wird geladen...</p>;
  uploads = vorgang?.uploads || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        Vorgang Zusammenfassung
      </h1>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">

        <div className="flex justify-between items-center mb-4 px-6">
        <div className="text-lg font-semibold text-gray-800">
           MOTORSPORT24-GmbH_{new Date(vorgang.erstelldatum).toISOString().slice(2, 10).replace(/-/g, '-')}_{vorgang.formdata?.invoiceNumber || '–'}
        </div>

        <div className="flex items-center gap-2">
  <strong>Status:</strong>
  {statusDarstellung(vorgang.status)}
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
      const mrn = formData.get('mrn')?.toString().trim();

      if (!mrn) {
        toast.error('Bitte eine gültige MRN eingeben');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mrn }),
        });

        if (res.ok) {
          toast.success('MRN gespeichert');
          loadVorgang();
        } else {
          toast.error('Fehler beim Speichern der MRN');
        }
      } catch (err) {
        console.error('❌ MRN-Speicherfehler:', err);
        toast.error('Serverfehler beim Speichern');
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

    <Tooltip.Provider delayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md shadow hover:from-blue-600 hover:to-blue-700 transition"
          >
            💾
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
            sideOffset={5}
          >
            MRN speichern
            <Tooltip.Arrow className="fill-gray-300" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
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
              const label = formData.get("label")?.toString().trim();
              if (!label || !formData.get("file")) {
                alert('Bitte Label und Datei auswählen');
                return;
              }
            
              const res = await fetch(`${API_BASE_URL}/api/vorgaenge/${id}/upload/generic`, {
                method: 'POST',
                body: formData,
              });
            
              if (res.ok) {
                toast("✅ Datei erfolgreich hochgeladen");
                setFileInputKey(Date.now());
                setSelectedLabel("");
                loadVorgang();
              } else {
                toast("❌ Fehler beim Hochladen");
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
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 h-[42px]"
              >
                <option disabled value="">Bitte auswählen</option>
                <option>Handelsrechnung</option>
                <option>Ausfuhrbegleitdokument</option>
                <option>Ausgangsvermerk</option>
              </select>
              </div>

              {/* Dateiinputfeld */}
              <div className="relative w-[30%]">
              <input
                key={fileInputKey}
                type="file"
                name="file"
                id="file"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md px-3 py-2 pr-10 cursor-pointer file:cursor-pointer file:border-0 file:bg-white file:text-transparent file:w-0"
              />
              </div>

              {/* Button */}
              <Tooltip.Provider delayDuration={100}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md shadow hover:from-blue-600 hover:to-blue-700 transition"
                    >
                      💾
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
                      sideOffset={5}
                    >
                      Datei speichern
                      <Tooltip.Arrow className="fill-gray-300" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>

            </div>
            </form>

          {/* 1/3: Iconbereich rechts */}
          <div className="w-1/3">
           <div className="text-center mb-1">
              <p className="text-base text-gray-800 font-bold mb-4">Vorgangs-Dateien</p>
            </div>
            <div className="flex justify-center items-center gap-4 pt-2">

            {/* Atlas-PDF */}
            {renderIcon("pdf", "/icons/sanduhr-leer-100.png", "Atlas Eingabedaten")}

            {/* Handelsrechnung */}
            {renderIcon("handelsrechnung", "/icons/sanduhr-leer-100.png", "Handelsrechnung")}

            {/* ABD */}
            {renderIcon("ausfuhrbegleitdokument", "/icons/sanduhr-leer-100.png", "ABD")}

            {/* AGV */}
            {renderIcon("ausgangsvermerk", "/icons/sanduhr-voll-100.png", "AGV")}

              {/* E-Mail */}
              <Tooltip.Provider delayDuration={100}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                  <button
                  disabled={!vorgang.files?.invoice}
                  onClick={async () => {
                    try {
                      const checkFileExists = async (url: string) => {
                        try {
                          const res = await fetch(url, { method: 'HEAD' });
                          return res.status === 200;
                        } catch {
                          return false;
                        }
                      };
                  
                      const hasUpload = (typ: string) =>
                        vorgang.uploads?.some((file: any) => file.typ?.toLowerCase().includes(typ.toLowerCase()));
                  
                      const typ = hasUpload('ausgangsvermerk')
                        ? 'agv'
                        : hasUpload('ausfuhrbegleitdokument')
                        ? 'abd'
                        : 'auftrag';
                  
                      const kunde = vorgang.formdata?.recipient?.name || 'Kunde';
                      const rechnungsnummer = vorgang.formdata?.invoiceNumber || 'Unbekannt';
                      const empfaengerLand = vorgang.formdata?.recipient?.country || '–';
                      const mrn = vorgang?.mrn || '';
                      const landKuerzel = empfaengerLand.slice(0, 2).toUpperCase();
                  
                      let subject = '';
                      let text = '';
                      const attachments: { url: string; name: string }[] = [];
                  
                      const heute = new Date();
                      const tag = heute.getDay();
                      const naechsterWerktag = new Date(heute);
                      if (tag === 5) naechsterWerktag.setDate(heute.getDate() + 3); // Fr → Mo
                      else if (tag === 6) naechsterWerktag.setDate(heute.getDate() + 2); // Sa → Mo
                      else naechsterWerktag.setDate(heute.getDate() + 1);
                      const datum = naechsterWerktag.toLocaleDateString('de-DE');
                  
                      if (typ === 'auftrag') {
                        subject = `Ausfuhranmeldung ${kunde} - Rg. ${rechnungsnummer}`;
                        text = `Lieber Kunde,\n\nvielen Dank für die Beauftragung.\n\nDie eventuelle Zollbeschau wurde soeben für ${datum} von 10:00 – 12:00 Uhr angemeldet. Im Anschluss erhalten Sie das Zolldokument.\n\nViele Grüße\n\nMOTORSPORT24\nDaniel Schwab`;
                      }
                  
                      if (typ === 'abd') {
                        subject = `👉🏼 ABD ${kunde} - Rg. ${rechnungsnummer}, MRN: ${mrn}`;
                        text = `Lieber Kunde,\n\nanbei erhalten Sie das Ausfuhrbegleitdokument, welches zusammen mit der Handelsrechnung an der Handelsware angebracht werden muss bzw. an der Zollausgangsstelle vorzuzeigen ist.\n\nNachdem die Ware die EU verlassen hat, erhalten Sie den Ausgangsvermerk.\n\nViele Grüße\n\nMOTORSPORT24\nDaniel Schwab\n\n`;
                      
                        const abdUrl = vorgang.files?.abd;
                        const invoiceUrl = vorgang.files?.invoice;
                      
                        if (abdUrl && (await checkFileExists(abdUrl))) {
                          attachments.push({ url: abdUrl, name: `ABD_${rechnungsnummer}_${mrn}.pdf` });
                        } else {
                          text += `\n\n⚠️ Hinweis: ABD konnte nicht automatisch angehängt werden.`;
                        }
                      
                        if (invoiceUrl && (await checkFileExists(invoiceUrl))) {
                          attachments.push({ url: invoiceUrl, name: `Rechnung_${rechnungsnummer}.pdf` });
                        } else {
                          text += `\n\n⚠️ Hinweis: Rechnung konnte nicht automatisch angehängt werden.`;
                        }
                      }                      
                  
                      if (typ === 'agv') {
                        subject = `✅ AGV ${kunde} - Rg. ${rechnungsnummer}, MRN: ${mrn}`;
                        text = `Lieber Kunde,\n\nanbei erhalten Sie den Ausgangsvermerk für Ihre Unterlagen bzw. zur Vorlage bei den Finanzbehörden.\n\nViele Grüße\n\nMOTORSPORT24\nDaniel Schwab\n\n`;
                      
                        const agvUrl = vorgang.files?.agv;
                        const invoiceUrl = vorgang.files?.invoice;
                      
                        if (agvUrl && (await checkFileExists(agvUrl)))
                          attachments.push({ url: agvUrl, name: `AGV_${rechnungsnummer}_${mrn}.pdf` });
                      
                        if (invoiceUrl && (await checkFileExists(invoiceUrl)))
                          attachments.push({ url: invoiceUrl, name: `Rechnung_${rechnungsnummer}.pdf` });
                      }                      
                  
                      const res = await fetch(`${API_BASE_URL}/api/send-email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          to: 'danielschwab@me.com',
                          subject,
                          text,
                          attachments,
                        }),
                      });
                  
                      const result = await res.json();
                      if (result.success) {
                        toast.success('📧 Mail erfolgreich versendet');
                      } else {
                        toast.error('❌ Versand fehlgeschlagen');
                      }
                    } catch (err) {
                      toast.error('❌ Fehler beim E-Mail-Versand');
                      console.error('E-Mail-Fehler:', err);
                    }
                  }}                  
                  className="hover:scale-105 transition-transform"
                >
                  <img
                    src="/icons/mail-100.png"
                    className={`h-8 ${!vorgang.files?.invoice ? 'cursor-not-allowed opacity-25' : 'opacity-100 hover:opacity-100'}`}
                  />
                </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="top"
                      className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
                    >
                      {vorgang.files?.agv
                        ? 'AGV per E-Mail versenden'
                        : vorgang.files?.abd
                        ? 'ABD per E-Mail versenden'
                        : vorgang.files?.invoice
                        ? 'Auftragsbestätigung senden'
                        : 'Dateien fehlen'}
                      <Tooltip.Arrow className="fill-gray-300" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>

          </div>

        </div>

        </div>
      </div>

      {uploads.some(file =>
        (file.typ?.toLowerCase().includes('ausgangsvermerk') || file.typ?.toLowerCase().includes('agv')) &&
        file.archiv_loeschdatum
      ) && (
        <div className="px-6 mb-2 mt-10 text-sm text-gray-700">
          &nbsp;<strong>Hinweis: </strong>
          Der Ausgangsvermerk wird am&nbsp;
          {
            new Date(
              uploads.find(f =>
                (f.typ?.toLowerCase().includes('ausgangsvermerk') || f.typ?.toLowerCase().includes('agv')) &&
                f.archiv_loeschdatum
              )?.archiv_loeschdatum
            ).toLocaleDateString('de-DE')
          }
          &nbsp;automatisch gelöscht.
        </div>
      )}

        {vorgang.notizen?.trim() !== '' && (
          <div className="px-6 mb-2 text-sm text-gray-700">
            &nbsp;<strong>Notizen:</strong> {vorgang.notizen}
          </div>
        )}

        <div className="flex gap-4 mt-8 justify-end px-6">
        <Tooltip.Provider delayDuration={100}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
            <button
              onClick={handleDelete}
              className="bg-white hover:bg-red-100 text-red-600 px-4 py-2 rounded border border-red-300"
            >
              ❌ Löschen
            </button>
              
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
                sideOffset={5}
              >
                Vorgang unwiderruflich löschen
                <Tooltip.Arrow className="fill-gray-300" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <Tooltip.Provider delayDuration={100}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => alert('✅ Vorgang archiviert')}
                className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded border border-green-300"
              >
                ✅ Archivieren
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
                sideOffset={5}
              >
                Vorgang als abgeschlossen markieren
                <Tooltip.Arrow className="fill-gray-300" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        </div>
      </div>
    </div>
  );
}