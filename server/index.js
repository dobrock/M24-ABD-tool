const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// SQLite Datenbank initialisieren
const db = new sqlite3.Database('./vorgaenge.db');

// Tabelle anlegen (falls noch nicht existiert)
db.run(`
  CREATE TABLE IF NOT EXISTS vorgaenge (
    id TEXT PRIMARY KEY,
    erstelldatum TEXT,
    mrn TEXT,
    empfaenger TEXT,
    land TEXT,
    waren TEXT,
    status TEXT,
    notizen TEXT
  )
`);

// Vorgang anlegen
app.post('/api/vorgang', (req, res) => {
  const id = uuidv4();
  const { mrn, empfaenger, land, waren, status, notizen } = req.body;
  const datum = new Date().toISOString();
  db.run(`INSERT INTO vorgaenge (id, erstelldatum, mrn, empfaenger, land, waren, status, notizen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, datum, mrn, empfaenger, land, waren, status || 'offen', notizen || ''],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ success: true, id });
    });
});

// Vorgänge anzeigen
app.get('/api/vorgaenge', (req, res) => {
  db.all(`SELECT * FROM vorgaenge ORDER BY erstelldatum DESC`, [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// Vorgang nach ID anzeigen
app.get('/api/vorgang/:id', (req, res) => {
  db.get(`SELECT * FROM vorgaenge WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).send(err);
    if (!row) return res.status(404).send('Nicht gefunden');
    res.json(row);
  });
});

const port = 3001;
app.listen(port, () => console.log(`Server läuft unter http://localhost:${port}`));
