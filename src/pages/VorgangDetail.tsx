import React from 'react';
import { useParams } from 'react-router-dom';

export default function VorgangDetail() {
  const { id } = useParams();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Vorgangsdetails</h1>
      <p>Hier können später die Details zum Vorgang mit der ID <strong>{id}</strong> angezeigt und bearbeitet werden.</p>
    </div>
  );
}
