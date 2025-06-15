function sanitize(str) {
  return str?.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '') || 'Unbekannt';
}

function buildFilename({ typ, kunde, rechnungsnummer, mrn }) {
  const safeName = sanitize(kunde);
  const safeInvoice = sanitize(rechnungsnummer);
  const safeMrn = mrn ? `_${sanitize(mrn)}` : '';

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '_'); // z. B. 2025_06_14

  switch (typ) {
    case 'rechnung':
      return `Rg_${safeName}_${safeInvoice}.pdf`;
    case 'abd':
      return `ABD_${safeName}_${safeInvoice}${safeMrn}.pdf`;
    case 'agv':
      return `AGV_${safeName}_${safeInvoice}${safeMrn}.pdf`;
    case 'pdf': // Atlas Eingabe
    default:
      return `Atlas_${safeName}_${safeInvoice || today}.pdf`;
  }
}

module.exports = { buildFilename };