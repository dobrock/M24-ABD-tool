import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Vorgang {
  id: string;
  erstelldatum: string;
  kundename: string;
  mrn: string;
  empfaenger: string;
  land: string;
  waren: string;
  status: string;
  notizen: string;
}

export default function VorgangDetail() {
  const { id } = useParams<{ id: string }>();
  const [vorgang, setVorgang] = useState<Vorgang | null>(null);

  useEffect(() => {
    const loadVorgang = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/vorgang/${id}`);
        if (res.ok) {
          const data = await res.json();
          setVorgang(data);
        } else {
          console.error('Vorgang nicht gefunden');
        }
      } catch (err) {
        console.error('Fehler beim Laden:', err);
      }
    };
    loadVorgang();
  }, [id]);

  if (!vorgang) return <p>Vorgang wird geladen...</p>;

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Vorgangsdetails</h1>
      <div className="bg-white shadow p-4 rounded space-y-2">
        <p><strong>ID:</strong> {vorgang.id}</p>
        <p><strong>Erstelldatum:</strong> {new Date(vorgang.erstelldatum).toLocaleDateString()}</p>
        <p><strong>Kundename:</strong> {vorgang.kundename}</p>
        <p><strong>MRN:</strong> {vorgang.mrn}</p>
        <p><strong>Status:</strong> <span className="font-semibold">{vorgang.status}</span></p>
        <p><strong>Empfänger:</strong> {vorgang.empfaenger}</p>
        <p><strong>Land:</strong> {vorgang.land}</p>
        <p><strong>Waren:</strong> {vorgang.waren}</p>
        <p><strong>Notizen:</strong> {vorgang.notizen}</p>
      </div>
      <Link to="/verwaltung" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
        Zurück zur Verwaltung
      </Link>
    </div>
  );
}