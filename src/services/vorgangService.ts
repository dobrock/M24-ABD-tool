const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Vorgang {
  id?: string;
  kundename: string;
  mrn: string;
  empfaenger?: string;
  land?: string;
  waren?: string;
  status?: string;
  notizen?: string;
  erstelldatum?: string;
}

// Alle Vorgänge laden
export async function getVorgaenge(): Promise<Vorgang[]> {
  const res = await fetch(`${API_BASE_URL}/api/vorgaenge`);
  if (!res.ok) throw new Error('Fehler beim Laden der Vorgänge');
  return res.json();
}

// Vorgang anlegen
export async function createVorgang(vorgang: Vorgang): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/vorgang`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vorgang),
  });
  if (!res.ok) throw new Error('Fehler beim Anlegen des Vorgangs');
}

// Vorgang aktualisieren (nur Name und MRN)
export async function updateVorgang(id: string, vorgang: Partial<Vorgang>): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vorgang),
  });
  if (!res.ok) throw new Error('Fehler beim Aktualisieren des Vorgangs');
}

// Vorgang löschen
export async function deleteVorgang(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/vorgaenge/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Fehler beim Löschen des Vorgangs');
}