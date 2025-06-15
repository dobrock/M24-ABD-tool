export function generateEmailLink({
    typ,
    vorgang,
  }: {
    typ: 'auftrag' | 'abd' | 'agv';
    vorgang: any;
  }) {
    const kunde = vorgang.formdata?.recipient?.name || 'Kunde';
    const rechnungsnummer = vorgang.formdata?.invoiceNumber || 'Unbekannt';
    const empfaengerLand = vorgang.formdata?.recipient?.country || '–';
    const mrn = vorgang?.mrn || '';
  
    const landKuerzel = empfaengerLand.slice(0, 2).toUpperCase();
    const heute = new Date();
    const tag = heute.getDay();
    const naechsterWerktag = new Date(heute);
    if (tag === 5) naechsterWerktag.setDate(heute.getDate() + 4); // Freitag → Dienstag
    else if (tag === 6) naechsterWerktag.setDate(heute.getDate() + 3); // Samstag → Dienstag
    else if (tag === 0) naechsterWerktag.setDate(heute.getDate() + 2); // Sonntag → Dienstag
    else if (tag === 1) naechsterWerktag.setDate(heute.getDate() + 1); // Montag → Dienstag
    else naechsterWerktag.setDate(heute.getDate() + 1); // Normaler nächster Werktag
  
    const datum = naechsterWerktag.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  
    let subject = '';
    let body = '';
  
    if (typ === 'auftrag') {
      subject = `Ausfuhranmeldung ${kunde}, ${landKuerzel} – ${rechnungsnummer}`;
      body = `Lieber Kunde,%0D%0A%0D%0Avielen Dank für die Beauftragung.%0D%0A%0D%0ADie eventuelle Zollbeschau wurde soeben für ${datum} von 10:00 bis 12:00 Uhr angemeldet. Im Anschluss sende ich Ihnen das Zolldokument.`;
    } else if (typ === 'abd') {
      subject = `👉🏼 ABD ${kunde}, ${landKuerzel} – ${rechnungsnummer}, MRN ${mrn}`;
      body = `Lieber Kunde,%0D%0A%0D%0Aanbei erhalten Sie das Ausfuhrbegleitdokument, welches zusammen mit der Handelsrechnung an der Handelsware angebracht werden muss bzw. an der Zollausgangsstelle vorgezeigt werden muss.%0D%0A%0D%0ANachdem die Ware die EU verlassen hat, erhalten Sie den Ausgangsvermerk.`;
    } else if (typ === 'agv') {
      subject = `✅ AGV ${kunde}, ${landKuerzel} – ${rechnungsnummer}, MRN ${mrn}`;
      body = `Lieber Kunde,%0D%0A%0D%0Aanbei erhalten Sie den Ausgangsvermerk für Ihre Unterlagen bzw. zur Vorlage bei den Finanzbehörden.`;
    }
  
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
  }
  