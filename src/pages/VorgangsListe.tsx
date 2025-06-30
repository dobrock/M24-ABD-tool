import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'react-hot-toast';
import { getFileUrl } from '@/lib/utils';
import KundenDashboard from '@/components/KundenDashboard';
import MandantenFilter from '@/components/MandantenFilter';
import VorgangsTabelle from '@/components/VorgangsTabelle';
import M24Dashboard from '@/components/M24Dashboard';

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

export default function VorgangsListe() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const initialMandant = params.get('mandant') || 'alle';
  console.log("📍 Übergabe Query:", location.search);
  console.log("📌 Initialer Mandant:", initialMandant);

  const [selectedMandant, setSelectedMandant] = useState(initialMandant);
  const [vorgaenge, setVorgaenge] = useState<Vorgang[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMrnId, setEditingMrnId] = useState<string | null>(null);
  const [tempMrn, setTempMrn] = useState<string>('');
  const [dashboardVisible, setDashboardVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newMandant = params.get('mandant') || 'alle';
    console.log("🔄 Mandant-Wechsel erkannt:", newMandant);
    setSelectedMandant(newMandant);
  }, [location.search]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const gefilterteVorgaenge = selectedMandant === 'alle'
    ? vorgaenge
    : vorgaenge.filter(v => v.mandant === selectedMandant);

  const getUploadUrl = (uploads: any[], typ: string) => {
    const eintrag = uploads.find(file =>
      file.typ?.toLowerCase().includes(typ.toLowerCase())
    );
    return eintrag?.url || null;
  };

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

  useEffect(() => {
    loadVorgaenge();
  }, []);

  const loadVorgaenge = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/vorgaenge`);
      const data = await res.json();
      setVorgaenge(data);
    } catch (err) {
      console.error('Fehler beim Laden:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
        loadVorgaenge();
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
      <div className="flex justify-between items-center mb-4">
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Mandant auswählen
        </label>
        <select
          className="border border-gray-300 px-2 py-1 rounded text-sm"
          value={selectedMandant}
          onChange={(e) => {
            const newValue = e.target.value;
            setSelectedMandant(newValue);
            navigate(`/vorgaenge?mandant=${newValue}`);
          }}
        >
          <option value="alle">Alle</option>
          <option value="m24">MOTORSPORT24</option>
          <option value="kk">KK Automobile</option>
        </select>
      </div>

  <button
    onClick={() => setDashboardVisible(!dashboardVisible)}
    className="text-gray-800 hover:text-gray-800 transition flex items-center gap-1 text-sm"
  >
    {dashboardVisible ? '▲ Statistiken ausblenden' : '▼ Statistiken anzeigen'}
  </button>
</div>

        {dashboardVisible && selectedMandant === 'kk' && (
          <div className="mb-6">
            <KundenDashboard
              visible={dashboardVisible}
              mandantName="KK Automobile GmbH"
              ausfuhren={gefilterteVorgaenge.length}
              umsatz={gefilterteVorgaenge.reduce((sum, v) => sum + (v.formdata?.invoiceTotal || 0), 0)}
              topLaender={[
                { land: 'USA', anzahl: 4 },
                { land: 'Norwegen', anzahl: 2 },
              ]}
            />
          </div>
        )}

        {dashboardVisible && selectedMandant === 'm24' && (
          <div className="mb-6">
            <M24Dashboard
              ausfuhren={gefilterteVorgaenge.length}
              topLaender={[
                { land: 'Norwegen', anzahl: 3 },
                { land: 'Schweiz', anzahl: 2 },
              ]}
            />
          </div>
        )}

        {isLoading ? (
          <div className="py-6 flex flex-col items-center gap-2 w-full">
            <div className="relative w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lime-400/60 to-transparent animate-shimmer" />
            </div>
            <p className="text-sm text-gray-500">Daten werden geladen…</p>
          </div>
        ) : vorgaenge.length === 0 ? (
          <p>Keine Vorgänge vorhanden.</p>
        ) : (
          <VorgangsTabelle
            vorgaenge={gefilterteVorgaenge}
            onEdit={(id) => navigate(`/vorgaenge/${id}`)}
            onDelete={handleDelete}
            onStatusToggle={toggleStatus}
            onMrnUpdate={updateMrn}
            editingMrnId={editingMrnId}
            setEditingMrnId={setEditingMrnId}
            tempMrn={tempMrn}
            setTempMrn={setTempMrn}
          />
        )}
      </div>
    </div>
  );
}
