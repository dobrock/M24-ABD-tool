type EmailTyp = 'auftrag' | 'abd' | 'agv';

export const generateEmailLink = ({
  typ,
  vorgang,
}: {
  typ: EmailTyp;
  vorgang: any;
}) => {
  const name = vorgang.formdata?.recipient?.name || '–';
  const country = vorgang.formdata?.recipient?.country || '';
  const landkuerzel = country.length === 2 ? country.toUpperCase() : country.slice(0, 2).toUpperCase();
  const rechnungsnr = vorgang.formdata?.invoiceNumber || '–';
  const mrn = vorgang.mrn || '–';

  const getNaechsterWerktag = () => {
    const today = new Date();
    let next = new Date(today);
    next.setDate(today.getDate() + 1);

    if (next.getDay() === 1) next.setDate(next.getDate() + 1); // Montag → Dienstag
    while (next.getDay() === 0 || next.getDay() === 6) {
      next.setDate(next.getDate() + 1); // Wochenende überspringen
    }

    return next.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    });
  };

  let subject = '';
  let body = '';

  if (typ === 'auftrag') {
    subject = `Ausfuhranmeldung ${name}, ${landkuerzel} – ${rechnungsnr}`;
    body = `Lieber Kunde,\n\nvielen Dank für die Beauftragung.\n\nDie eventuelle Zollbeschau wurde soeben für ${getNaechsterWerktag()} 10:00 - 12:00 Uhr angemeldet. Im Anschluss sende ich Ihnen das Zolldokument.\n\n---`;
  }

  if (typ === 'abd') {
    subject = `👉🏼 ABD ${name}, ${landkuerzel} – ${rechnungsnr}, ${mrn}`;
    body = `Lieber Kunde,\n\nanbei erhalten Sie das Ausfuhrbegleitdokument, welches zusammen mit der Handelsrechnung an der Handelsware angebracht werden muss bzw. an der Zollausgangsstelle vorgezeigt werden muss.\n\nNachdem die Ware die EU verlassen hat, erhalten Sie den Ausgangsvermerk.\n\nAnlagen: AGV, Handelsrechnung`;
  }

  if (typ === 'agv') {
    subject = `✅ AGV ${name}, ${landkuerzel} – ${rechnungsnr}, ${mrn}`;
    body = `Lieber Kunde,\n\nanbei erhalten Sie den Ausgangsvermerk für Ihre Unterlagen bzw. zur Vorlage bei den Finanzbehörden.\n\nAnlagen: AGV, ABD`;
  }

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
