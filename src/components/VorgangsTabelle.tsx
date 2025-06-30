import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface Vorgang {
  id: string;
  empfaenger: string;
  land: string;
  mrn: string;
  erstelldatum: string;
  status: string;
  uploads?: any[];
  formdata?: any;
}

interface Props {
  vorgaenge: Vorgang[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusToggle: (vorgang: Vorgang) => void;
  onMrnUpdate: (id: string, newMrn: string) => void;
  editingMrnId: string | null;
  setEditingMrnId: (id: string | null) => void;
  tempMrn: string;
  setTempMrn: (value: string) => void;
}

const statusIcons: Record<string, string> = {
  angelegt: '🫨',
  ausfuhr_beantragt: '🤞🏻',
  abd_erhalten: '🥳',
  agv_vorliegend: '✅',
};

const statusLabels: Record<string, string> = {
  angelegt: 'Angelegt',
  ausfuhr_beantragt: 'Ausfuhr beantragt',
  abd_erhalten: 'ABD erhalten',
  agv_vorliegend: 'AGV liegt vor',
};

export default function VorgangsTabelle({
  vorgaenge,
  onEdit,
  onDelete,
  onStatusToggle,
  onMrnUpdate,
  editingMrnId,
  setEditingMrnId,
  tempMrn,
  setTempMrn
}: Props) {
  return (
    <div className="overflow-hidden rounded-md">
      <table className="min-w-full bg-white table-fixed">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="w-80 text-left px-4 py-2 text-sm">Empfänger</th>
            <th className="w-24 text-center px-4 py-2 text-sm">Land</th>
            <th className="w-40 text-left px-4 py-2 text-sm">MRN</th>
            <th className="text-left px-4 py-2 text-sm whitespace-nowrap">Erstellt am</th>
            <th className="w-48 text-left px-4 py-2 text-sm">Status</th>
            <th className="w-20 text-center px-4 py-2 text-sm">Aktion</th>
          </tr>
        </thead>
        <tbody>
        {vorgaenge.map((vorgang) => {
          const country = vorgang.formdata?.recipient?.country || '';
          const countryCode = country.length === 2
            ? country.toUpperCase()
            : country === 'USA' ? 'US'
            : country === 'China' ? 'CN'
            : country === 'Japan' ? 'JP'
            : country === 'Norwegen' ? 'NO'
            : country === 'Schweiz' ? 'CH'
            : country === 'Spanien' ? 'ES'
            : country === 'Australien' ? 'AU'
            : country === 'England' ? 'GB'
            : country === 'UK' ? 'GB'
            : country.slice(0, 2).toUpperCase();

          const isLocked = vorgang.status === 'abd_erhalten' || vorgang.status === 'agv_vorliegend';
          const statusTooltip =
            vorgang.status === 'abd_erhalten'
              ? 'Warten auf AGV'
              : vorgang.status === 'agv_vorliegend'
              ? 'Ware ausgeführt'
              : 'Klicken zum Statuswechsel';

          return (
            <tr key={vorgang.id} className="border-b">
              <td className="px-4 py-2 text-sm whitespace-nowrap">
                <span
                  onClick={() => onEdit(vorgang.id)}
                  className="cursor-pointer text-black"
                >
                  {vorgang.formdata?.recipient?.name || '—'}
                </span>
              </td>

              <td className="px-4 py-2 text-sm text-center align-middle">
                <Tooltip.Provider delayDuration={150}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <span className="inline-block w-full text-center cursor-default">
                        {countryCode || '—'}
                      </span>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
                        sideOffset={5}
                      >
                        {country || 'Unbekannt'}
                        <Tooltip.Arrow className="fill-gray-300" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </td>

              <td className="px-4 py-2 text-sm align-middle">
                {editingMrnId === vorgang.id ? (
                  <input
                    type="text"
                    value={tempMrn}
                    autoFocus
                    onChange={(e) => setTempMrn(e.target.value)}
                    onBlur={() => onMrnUpdate(vorgang.id, tempMrn)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onMrnUpdate(vorgang.id, tempMrn);
                      if (e.key === 'Escape') setEditingMrnId(null);
                    }}
                    className="w-full border border-gray-300 px-2 py-1 text-sm"
                  />
                ) : (
                        <span
                          className={`cursor-pointer ${vorgang.mrn ? 'truncate max-w-[160px] inline-block align-middle' : 'text-gray-200'}`}
                          onClick={() => {
                            setEditingMrnId(vorgang.id);
                            setTempMrn(vorgang.mrn || '');
                          }}
                        >
                          {vorgang.mrn || '—'}
                        </span>
                )}
              </td>

              <td className="px-4 py-2 text-sm whitespace-nowrap align-middle">
                {new Date(vorgang.erstelldatum).toLocaleDateString()}
              </td>

              <td className="px-4 py-2 text-sm whitespace-nowrap align-middle">
                <Tooltip.Provider delayDuration={150}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isLocked ? 'text-gray-600 cursor-default' : 'cursor-pointer hover:text-blue-600'
                        }`}
                        onClick={() => !isLocked && onStatusToggle(vorgang)}
                      >
                        {statusIcons[vorgang.status]} {statusLabels[vorgang.status]}
                      </span>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-white border text-black px-3 py-1.5 rounded shadow text-sm"
                        sideOffset={5}
                      >
                        {statusTooltip}
                        <Tooltip.Arrow className="fill-white" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </td>

              <td className="px-4 py-2 text-sm align-middle">
                <div className="flex justify-center items-center">
                  <Tooltip.Provider delayDuration={200}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <img
                          src="/icons/kreuz-rot-50.png"
                          onMouseEnter={(e) => (e.currentTarget.src = '/icons/kreuz-rot-100.png')}
                          onMouseLeave={(e) => (e.currentTarget.src = '/icons/kreuz-rot-50.png')}
                          className="h-[16px] cursor-pointer transition-transform hover:scale-110"
                          alt="Löschen"
                          onClick={() => {
                            if (window.confirm('Diesen Vorgang wirklich löschen?')) {
                              onDelete(vorgang.id);
                            }
                          }}
                        />
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-white text-gray-900 border border-gray-300 text-sm px-4 py-2 rounded shadow-md z-50"
                          sideOffset={5}
                        >
                          Vorgang löschen
                          <Tooltip.Arrow className="fill-gray-300" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
}
