import React from 'react';

interface MandantenFilterProps {
  selected: string;
  onChange: (value: string) => void;
}

export default function MandantenFilter({ selected, onChange }: MandantenFilterProps) {
  return (
    <div className="mb-6 max-w-xs">
      <label htmlFor="mandant-select" className="block text-sm font-medium text-gray-700 mb-1">
        Mandant auswählen
      </label>
      <select
        id="mandant-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm shadow-sm"
      >
        <option value="alle">Alle</option>
        <option value="m24">MOTORSPORT24 GmbH</option>
        <option value="kk">KK Automobile GmbH</option>
      </select>
    </div>
  );
}
