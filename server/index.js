const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Lokale DB löschen (nur Entwicklungszwecke, kannst du entfernen für Live)
const dbFile = './vorgaenge.db';
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
  console.log('Lokale Datenbank gelöscht, wird beim Start neu erstellt.');
}

// SQLite initialisieren
const db = new sqlite3.Database('./vorgaenge.db');

// Tabelle anlegen
db.run(`
  CREATE TABLE IF NOT EXISTS vorgaenge (
    id TEXT PRIMARY KEY,
    erstelldatum TEXT,
    empfaenger TEXT,
    land TEXT,
    mrn TEXT,
    status TEXT,
    notizen TEXT
  )
`);

// Vorgang anlegen (Status automatisch 'angelegt')
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

// Alle Vorgänge anzeigen
app.get('/api/vorgaenge', (req, res) => {
  db.all(`SELECT * FROM vorgaenge ORDER BY erstelldatum DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Einzelnen Vorgang anzeigen
app.get('/api/vorgang/:id', (req, res) => {
  db.get(`SELECT * FROM vorgaenge WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).send(err);
    if (!row) return res.status(404).send('Nicht gefunden');
    res.json(row);
  });
});

// Vorgang löschen
app.delete('/api/vorgaenge/:id', (req, res) => {
  db.run('DELETE FROM vorgaenge WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Vorgang gelöscht' });
  });
});

// Vorgang bearbeiten (inkl. Empfänger, Land, MRN, Status, Notizen)
app.put('/api/vorgaenge/:id', (req, res) => {
  const { id } = req.params;
  const { empfaenger, land, mrn, status, notizen } = req.body;
  if (!empfaenger || !land || !mrn || !status) {
    return res.status(400).json({ error: 'Empfänger, Land, MRN und Status erforderlich' });
  }
  db.run(
    'UPDATE vorgaenge SET empfaenger = ?, land = ?, mrn = ?, status = ?, notizen = ? WHERE id = ?',
    [empfaenger, land, mrn, status, notizen || '', id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Vorgang aktualisiert' });
    }
  );
});

// Status aktualisieren (nur Status-Feld separat änderbar)
app.patch('/api/vorgaenge/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['angelegt', 'beantragt', 'abd', 'agv'];
  const allowedStatuses = ['angelegt', 'ausfuhr_beantragt', 'abd_erhalten', 'agv_vorliegend'];
    return res.status(400).json({ error: 'Ungültiger Status' });
  }
  db.run(
    'UPDATE vorgaenge SET status = ? WHERE id = ?',
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Vorgang nicht gefunden' });
      res.json({ message: 'Status aktualisiert' });
    }
  );
});

const port = 3001;
app.listen(port, () => console.log(`Server läuft unter http://localhost:${port}`));