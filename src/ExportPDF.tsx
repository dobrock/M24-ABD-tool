import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import logoData from './assets/MOTORSPORT24-Logo_768px.png';

const countryCodes = {
  Australien: 'AU',
  China: 'CN',
  England: 'GB',
  Großbritannien: 'GB',
  Japan: 'JP',
  Neuseeland: 'NZ',
  Norwegen: 'NO',
  Schweiz: 'CH',
  Südkorea: 'KR',
  USA: 'US',
  'Vereinigte Staaten': 'US',
  'Vereinigtes Königreich': 'GB'
};

export async function generatePDF(formData) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const drawText = (text, x, y, size = 10, color = rgb(0, 0, 0)) => {
    page.drawText(text, { x, y, size, font, color });
  };

  const drawSectionTitle = (title, y) => {
    page.drawRectangle({ x: 50, y: y - 5, width: width - 100, height: 20, color: rgb(0.85, 0.85, 0.85) });
    drawText(title, 55, y + 2, 11, rgb(0.2, 0.2, 0.4));
    return y - 20;
  };

  try {
    const logoImageBytes = await fetch(logoData).then(res => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(logoImageBytes);
    const pngDims = pngImage.scale(0.15);
    page.drawImage(pngImage, {
      x: width - pngDims.width - 50,
      y: height - pngDims.height - 50,
      width: pngDims.width,
      height: pngDims.height
    });
  } catch (e) {
    drawText('[Logo konnte nicht geladen werden]', width - 200, height - 30);
  }

  drawText('Zusammengefasste Daten für die Ausfuhr', 50, height - 70, 14);
  drawText(`Erstellt am: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 50, height - 85, 9);

  let y = height - 110;

  y = drawSectionTitle('1. Art der Anmeldung', y);
  drawText('Typ: EX – Ausfuhr oder Wiederausfuhr von Gütern außerhalb des Zollgebiets der Union', 50, y); y -= 12;
  drawText('Art der Ausfuhranmeldung: 00000200 (Standard-Ausfuhranmeldung)', 50, y); y -= 12;
  const now = new Date();
  const gestellung = new Date(now);
  do {
    gestellung.setDate(gestellung.getDate() + 1);
  } while (gestellung.getDay() === 0 || gestellung.getDay() === 6);
  if (now.getDay() === 5 || now.getDay() === 6 || now.getDay() === 0) {
    gestellung.setDate(gestellung.getDate() + 1);
    while (gestellung.getDay() === 0 || gestellung.getDay() === 6) {
      gestellung.setDate(gestellung.getDate() + 1);
    }
  }
  drawText(`Gestellung von: ${gestellung.toLocaleDateString()} 10:00 bis 12:00`, 50, y); y -= 30;

  y = drawSectionTitle('2. Allgemein', y);
  const countryCode = countryCodes[formData.recipient.country] || formData.recipient.country;
  drawText(`Bestimmungsland: ${countryCode}`, 50, y); y -= 12;
  drawText('Ausfuhrland: DE', 50, y); y -= 12;
  const ausfuhrstelle = formData.loadingPlace.includes('Düderode') ? 'DE005080 – Göttingen' : 'DE003302 – Frankfurt am Main';
  const versendungsregion = formData.loadingPlace.includes('Düderode') ? '03 – Niedersachsen' : '11 – Berlin';
  drawText(`Ausfuhrzollstelle: ${ausfuhrstelle}`, 50, y); y -= 12;
  drawText('Ausgangszollstelle: DE003302 – Frankfurt am Main-Flughafen', 50, y); y -= 12;
  drawText('Sicherheitsstufe: 2 – Enthält die Daten einer summarischen Ausgangsanmeldung', 50, y); y -= 12;
  drawText('Beförderungskosten (Zahlungsart): H – Elektronischer Zahlungsverkehr', 50, y); y -= 12;
  const totalWeight = formData.items.reduce((acc, item) => acc + parseFloat(item.weight || '0'), 0);
  drawText(`Gesamt-Rohmasse: ${totalWeight.toFixed(3)} kg`, 50, y); y -= 12;
  drawText(`LRN / UCR: ${formData.invoiceNumber || '---'}`, 50, y); y -= 30;

  y = drawSectionTitle('3. Warenort', y);
  if (formData.loadingPlace.includes('Düderode')) {
    drawText('Art des Ortes: D – Anderer Ort', 50, y); y -= 12;
    drawText('Ortbestimmung: Z – Adresse', 50, y); y -= 12;
    drawText('Adresse: Obere Str. 17a, 37589 Düderode', 50, y); y -= 12;
    drawText('Zusatz: KK Automobile GmbH | Land: DE', 50, y); y -= 12;
    drawText('Ansprechpartner: Fritjof Schmitz | Tel: 05553 3163 | E-Mail: service@motorsport24.de', 50, y); y -= 30;
  } else {
    drawText('Art des Ortes: D – Anderer Ort', 50, y); y -= 12;
    drawText('Ortbestimmung: Z – Adresse', 50, y); y -= 12;
    drawText('Adresse: Scharfe Lanke 113a, 13595 Berlin', 50, y); y -= 12;
    drawText('Zusatz: MOTORSPORT24 GmbH | Land: DE', 50, y); y -= 12;
    drawText('Ansprechpartner: Daniel Schwab | Tel: 01721940111 | E-Mail: service@motorsport24.de', 50, y); y -= 30;
  }

  y = drawSectionTitle('4. Anmelder', y);
  drawText('EORI: DE243988567282961 | Niederlassung: 0000', 50, y); y -= 12;
  drawText('Ansprechpartner: Daniel Schwab | Tel: 01721940111 | E-Mail: service@motorsport24.de', 50, y); y -= 30;

  y = drawSectionTitle('5. Empfänger', y);
  drawText(`${formData.recipient.name}, ${formData.recipient.street}, ${formData.recipient.zip} ${formData.recipient.city}, ${countryCode}`, 50, y); y -= 30;

  y = drawSectionTitle('6. Versender', y);
  drawText('MOTORSPORT24 GmbH, Scharfe Lanke 109–131, 13595 Berlin, DE', 50, y); y -= 30;

  y = drawSectionTitle('7. Zusätzliche Informationen', y);
  if (formData.loadingPlace.includes('Düderode')) {
    drawText('X0000 – Verladeort 37589 Düderode | Mitteilung an die Ausfuhrzollstelle', 50, y); y -= 30;
  } else {
    drawText('Angaben bei Beladung Berlin bitte mit dem Zoll klären und ergänzen', 50, y); y -= 30;
  }

  y = drawSectionTitle('8. Vorpapier', y);
  drawText(`N380 Handelsrechnung | Referenz: ${formData.invoiceNumber || '---'}`, 50, y); y -= 30;

  y = drawSectionTitle('9. Verkehrszweig', y);
  drawText('Inland: 3 – Beförderung auf der Straße | Grenze: 4 – Beförderung auf dem Luftweg', 50, y); y -= 30;

  y = drawSectionTitle('10. Beförderungsmittel beim Abgang', y);
  drawText('30 – Amtliches Kennzeichen des LKW | DE – Deutschland', 50, y); y -= 30;

  y = drawSectionTitle('11. Grenzüberschreitendes aktives Beförderungsmittel', y);
  drawText('41 – Registriernummer des Luftfahrzeugs | FLUGZEUG | DE – Deutschland', 50, y); y -= 30;

  page = pdfDoc.addPage([595, 842]);
  y = height - 50;

  y = drawSectionTitle('12. Beförderungsroute', y);
  drawText(`1 – DE Deutschland | 2 – ${countryCode} ${formData.recipient.country}`, 50, y); y -= 30;

  y = drawSectionTitle('13. Lieferbedingungen (Incoterm)', y);
  drawText(`DAP – geliefert benannter Ort | Ort: ${formData.recipient.city} | Land: ${countryCode} – ${formData.recipient.country}`, 50, y); y -= 30;


  y = drawSectionTitle('14. Geschäftsvorgang / Rechnung', y);
  drawText('11 – Endgültiger Kauf/Verkauf, ausgenommen direkter Handel mit/durch private Verbraucher(n)', 50, y); y -= 12;
  drawText(`Gesamtbetrag: ${Number(formData.invoiceTotal || 0).toLocaleString('de-DE')} €`, 50, y); y -= 30;

  y = drawSectionTitle('15. Ware', y);
  formData.items.forEach((item, i) => {
    drawText(`${i + 1}. ${item.description}`, 50, y); y -= 12;
    drawText(`   Warennummer: ${item.tariff.slice(0, -2)} ${item.tariff.slice(-2)}`, 50, y); y -= 12;
    drawText(`   Rohmasse: ${parseFloat(item.weight).toFixed(2)} kg | Eigenmasse: ${(parseFloat(item.weight) * 0.9).toFixed(2)} kg`, 50, y); y -= 12;
    if (y < 80) {
      page = pdfDoc.addPage([595, 842]);
      y = height - 50;
    }
  });
  y -= 10;

  y = drawSectionTitle('16. Statistik', y);
  drawText(`Statistischer Wert: ${Number(formData.invoiceTotal || 0).toLocaleString('de-DE')} €`, 50, y); y -= 12;
  drawText('Menge in bes. Maßeinheit: 1,000000', 50, y); y -= 12;
  drawText(`Versendungsregion: ${versendungsregion}`, 50, y); y -= 12;
  drawText('Ursprungsland: DE – Deutschland', 50, y); y -= 30;

  y = drawSectionTitle('17. Verfahren', y);
  drawText('Verfahren: 10+00', 50, y); y -= 30;

  y = drawSectionTitle('18. Verpackung', y);
  drawText(`1 | PC | Paket | 1 | ${formData.invoiceNumber || '---'}`, 50, y); y -= 30;

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const nowDate = new Date();
  const timestamp = `${nowDate.getFullYear()}-${(nowDate.getMonth() + 1).toString().padStart(2, '0')}-${nowDate.getDate().toString().padStart(2, '0')}_${nowDate.getHours().toString().padStart(2, '0')}-${nowDate.getMinutes().toString().padStart(2, '0')}`;
  saveAs(blob, `ABD_${timestamp}.pdf`);
}