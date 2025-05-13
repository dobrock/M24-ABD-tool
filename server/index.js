const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// SQLite initialisieren
const db = new sqlite3.Database('./vorgaenge.db');

// Tabelle anlegen (inkl. Felder für Vorgang)
db.run(`
  CREATE TABLE IF NOT EXISTS vorgaenge (
    id TEXT PRIMARY KEY,
    erstelldatum TEXT,
    empfaenger TEXT,
    land TEXT,
    mrn TEXT,
    status TEXT DEFAULT 'angelegt',
    notizen TEXT
  )
`);

// Upload-Konfiguration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `./uploads/${req.params.id}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.type}.pdf`);
  },
});
const upload = multer({ storage });

// Vorgang anlegen
app.post('/api/vorgang', (req, res) => {
  const id = uuidv4();
  const { empfaenger, land, mrn, notizen } = req.body;
  const datum = new Date().toISOString();
  db.run(`INSERT INTO vorgaenge (id, erstelldatum, empfaenger, land, mrn, status, notizen)
    VALUES (?, ?, ?, ?, ?, 'angelegt', ?)`,
    [id, datum, empfaenger, land, mrn, notizen || ''],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ success: true, id });
    });
});

// Alle Vorgänge mit Dokumentenstatus anzeigen
app.get('/api/vorgaenge', (req, res) => {
  db.all(`SELECT * FROM vorgaenge ORDER BY erstelldatum DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const result = rows.map((v) => ({
      ...v,
      hasPdf: fs.existsSync(`./uploads/${v.id}/pdf.pdf`),
      hasInvoice: fs.existsSync(`./uploads/${v.id}/rechnung.pdf`),
      hasAbd: fs.existsSync(`./uploads/${v.id}/abd.pdf`),
      hasAgv: fs.existsSync(`./uploads/${v.id}/agv.pdf`),
    }));
    res.json(result);
  });
});

// Einzelnen Vorgang anzeigen mit Dokumentstatus
app.get('/api/vorgang/:id', (req, res) => {
  db.get(`SELECT * FROM vorgaenge WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).send(err);
    if (!row) return res.status(404).send('Nicht gefunden');
    res.json({
      ...row,
      hasPdf: fs.existsSync(`./uploads/${row.id}/pdf.pdf`),
      hasInvoice: fs.existsSync(`./uploads/${row.id}/rechnung.pdf`),
      hasAbd: fs.existsSync(`./uploads/${row.id}/abd.pdf`),
      hasAgv: fs.existsSync(`./uploads/${row.id}/agv.pdf`),
    });
  });
});

// Vorgang löschen inkl. Dateien
app.delete('/api/vorgaenge/:id', (req, res) => {
  db.run('DELETE FROM vorgaenge WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    fs.rmSync(`./uploads/${req.params.id}`, { recursive: true, force: true });
    res.json({ message: 'Vorgang gelöscht' });
  });
});

// Status aktualisieren
app.patch('/api/vorgaenge/:id/status', (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['angelegt', 'ausfuhr_beantragt', 'abd_erhalten', 'agv_vorliegend'];
  if (!allowedStatuses.includes(status)) return res.status(400).json({ error: 'Ungültiger Status' });
  db.run('UPDATE vorgaenge SET status = ? WHERE id = ?', [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Vorgang nicht gefunden' });
    res.json({ message: 'Status aktualisiert', status });
  });
});

// Datei Upload (setzt Status bei ABD/AGV)
app.post('/api/vorgaenge/:id/upload/:type', upload.single('file'), (req, res) => {
  const { type } = req.params;
  const allowedTypes = ['pdf', 'rechnung', 'abd', 'agv'];
  if (!allowedTypes.includes(type)) return res.status(400).json({ error: 'Ungültiger Dokumententyp' });

  let newStatus = null;
  if (type === 'abd') newStatus = 'abd_erhalten';
  if (type === 'agv') newStatus = 'agv_vorliegend';

  if (newStatus) {
    db.run(`UPDATE vorgaenge SET status = ? WHERE id = ?`, [newStatus, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: `${type.toUpperCase()} hochgeladen und Status geändert` });
    });
  } else {
    res.json({ message: `${type.toUpperCase()} hochgeladen` });
  }
});

// Datei Download
app.get('/api/vorgaenge/:id/download/:type', (req, res) => {
  const filePath = `./uploads/${req.params.id}/${req.params.type}.pdf`;
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('Datei nicht gefunden');
  }
});

// Upload Rechnung
app.post('/api/vorgaenge/:id/upload/rechnung', upload.single('file'), (req, res) => {
  const id = req.params.id;
  const vorgang = vorgaenge[id];
  if (!vorgang) {
    return res.status(404).send('Vorgang nicht gefunden');
  }
  const filePath = path.join(uploadDir, id, 'rechnung.pdf');
  saveUploadedFile(req, filePath);
  vorgang.hasInvoice = true;  // ✅ Status nach Upload setzen
  res.json({ message: 'Rechnung hochgeladen' });
});

const port = 3001;
app.listen(port, () => console.log(`✅ API läuft unter http://localhost:${port}`));