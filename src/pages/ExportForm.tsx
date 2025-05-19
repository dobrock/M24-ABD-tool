import React, { useState, useEffect } from 'react';
import logo from '../assets/MOTORSPORT24-Logo_768px.png';
import { generatePDF } from '../ExportPDF';
import VorgangsTest from '../components/VorgangsTest';

const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log('🧪 API_BASE_URL:', API_BASE_URL);

export default function App() {
  const [items, setItems] = useState([
    { description: '', tariff: '', weight: '', value: '' }
  ]);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceTotal: '',
    loadingPlace: '',
    shippingMethod: '',
    recipient: {
      name: '',
      addition: '',
      street: '',
      zip: '',
      city: '',
      country: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('recipient.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        recipient: {
          ...prev.recipient,
          [key]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };
  
  const addItem = () => {
    setItems([...items, { description: '', tariff: '', weight: '', value: '' }]);
  };
  
  const handleSubmit = async () => {
    console.log('Form wird übermittelt');
    setIsSubmitting(true);
    setIsSuccess(false);
    setStatusMessage('');
  
    generatePDF({ ...formData, items });
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/vorgaenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mrn: formData.invoiceNumber,
          empfaenger: formData.recipient.name,
          land: formData.recipient.country,
          waren: items.map(i => i.description).join(', '),
          status: 'angelegt',
          notizen: 'Automatisch generiert'
        })
      });
  
      const result = await response.json();
      console.log('Antwort vom Server:', result);
  
      setIsSubmitting(false);
      setIsSuccess(true);
      setStatusMessage('✅ Eintrag gespeichert – du wirst zur Übersicht weitergeleitet ...');
  
      setRefreshKey(prev => prev + 1);
  
      // Sanfte Weiterleitung zur Übersicht
      setTimeout(() => {
        const overview = document.getElementById('vorgangsliste');
        if (overview) {
          overview.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    } catch (error) {
      console.error('Fehler beim automatischen Speichern:', error);
      setIsSubmitting(false);
      setIsSuccess(false);
      setStatusMessage('❌ Fehler beim Speichern. Bitte später erneut versuchen.');
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex justify-center mb-2">
          <img src={logo} alt="MOTORSPORT24 Logo" className="h-12 object-contain mb-6" />
        </div>
        <h1 className="text-1xl font-bold text-gray-700 text-left mb-8">
          NEUE AUSFUHRANMELDUNG
        </h1>

        {/* Block I: Ware */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">1. Ware</h2>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Warenbezeichnung DE/EN</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="z. B. Bremssattel / brake caliper"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Warentarifnummer</label>
                <input
                  type="text"
                  value={item.tariff}
                  onChange={(e) => handleItemChange(index, 'tariff', e.target.value)}
                  placeholder="z. B. 87083091"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gewicht (kg)</label>
                <input
                  type="text"
                  value={item.weight}
                  onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                  placeholder="z. B. 8.5"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">Wert (€)</label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                    placeholder="z. B. 1468"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                {index === items.length - 1 && (
                  <button onClick={addItem} className="mb-1 text-xl font-bold text-blue-500">
                    +
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Block II: Rechnungsinformationen */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">2. Rechnungsinformationen</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Rechnungsnummer</label>
              <input
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                type="text"
                placeholder="z. B. 2025-104122"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Rechnungsbetrag (€)</label>
              <input
                name="invoiceTotal"
                value={formData.invoiceTotal}
                onChange={handleChange}
                type="text"
                placeholder="z. B. 1468"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </section>

        {/* Block III: Beladeort */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">3. Beladeort</h2>
          <div className="md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ladeort wählen:
            </label>
            <select
              name="loadingPlace"
              value={formData.loadingPlace}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="">-- Bitte wählen --</option>
              <option value="Firmensitz">am Firmensitz</option>
              <option value="37589 Düderode">Gestellungsort 37589 Düderode</option>
            </select>
          </div>
        </section>

        {/* Block IV: Empfänger */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">4. Empfänger</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="recipient.name"
                value={formData.recipient.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name Zusatz</label>
              <input
                type="text"
                name="recipient.addition"
                value={formData.recipient.addition}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Straße</label>
              <input
                type="text"
                name="recipient.street"
                value={formData.recipient.street}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PLZ</label>
              <input
                type="text"
                name="recipient.zip"
                value={formData.recipient.zip}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ort</label>
              <input
                type="text"
                name="recipient.city"
                value={formData.recipient.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Land</label>
              <input
                type="text"
                name="recipient.country"
                value={formData.recipient.country}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </section>

        {/* Block V: Versandweg */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">5. Versandweg</h2>
          <div className="md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Versandweg wählen:
            </label>
            <select
              name="shippingMethod"
              value={formData.shippingMethod}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="">-- Bitte wählen --</option>
              <option value="Luftfracht">Luftfracht</option>
              <option value="Landweg Norwegen">Landweg Norwegen</option>
              <option value="Sonstiges">Sonstiges</option>
            </select>
          </div>
        </section>

        {/* Submit */}
        <div className="mt-12 text-center">
  <button
    onClick={handleSubmit}
    disabled={isSubmitting}
    className={`${
      isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    } text-white font-semibold py-2 px-6 rounded-xl shadow-md transition`}
  >
    {isSubmitting ? '⏳ Wird gesendet...' : isSuccess ? '✅ Erfolgreich' : 'Atlas Eingabe erstellen'}
  </button>
  {statusMessage && (
    <p className="mt-4 text-sm text-gray-600">{statusMessage}</p>
  )}
</div>
      </div>

      <div className="mt-12">
      <VorgangsTest key={refreshKey} />
      </div>
    </div>
  );
}