const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const app = express();

require('dotenv').config({ path: '.env.local' }); // explizit sicherstellen
console.log('📦 Verbinde mit PG:', process.env.PG_CONNECTION);

app.use(cors());
app.use(express.json());

// PostgreSQL Pool (Render DB)
const pool = new Pool({
  connectionString: process.env.PG_CONNECTION,
  ssl: { rejectUnauthorized: false }
});

// Tabelle anlegen (falls noch nicht existiert)
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vorgaenge (
        id UUID PRIMARY KEY,
        erstelldatum TIMESTAMP,
        mrn TEXT,
        empfaenger TEXT,
        land TEXT,
        waren TEXT,
        status TEXT,
        notizen TEXT
      )
    `);
    console.log('✅ Tabelle vorgaenge bereit.');
  } catch (err) {
    console.error('❌ Fehler beim Initialisieren der Datenbank:', err);
  }
};

// Vorgang anlegen
app.post('/api/vorgaenge', async (req, res) => {
  const id = uuidv4();
  const { mrn, empfaenger, land, waren, status, notizen } = req.body;
  try {
    await pool.query(
      `INSERT INTO vorgaenge (id, erstelldatum, mrn, empfaenger, land, waren, status, notizen)
       VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7)`,
      [id, mrn, empfaenger, land, waren, status || 'offen', notizen || '']
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error('❌ Fehler beim Anlegen des Vorgangs:', err);
    res.status(500).send(err.message);
  }
});

// Vorgänge anzeigen
app.get('/api/vorgaenge', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM vorgaenge ORDER BY erstelldatum DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Fehler beim Abrufen:', err);
    res.status(500).send(err.message);
  }
});

// Vorgang nach ID anzeigen
app.get('/api/vorgaenge/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM vorgaenge WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('Nicht gefunden');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Fehler beim Abrufen des Vorgangs:', err);
    res.status(500).send(err.message);
  }
});

// Status eines Vorgangs ändern
app.patch('/api/vorgaenge/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query(`UPDATE vorgaenge SET status = $1 WHERE id = $2`, [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Fehler beim Status-Update:', err);
    res.status(500).send(err.message);
  }
});

// MRN aktualisieren
app.patch('/api/vorgaenge/:id', async (req, res) => {
  const { id } = req.params;
  const { mrn } = req.body;
  try {
    await pool.query(`UPDATE vorgaenge SET mrn = $1 WHERE id = $2`, [mrn, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Fehler beim Aktualisieren der MRN:', err);
    res.status(500).send(err.message);
  }
});

// Download Vorgang (Platzhalter PDF)
app.get('/api/download/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM vorgaenge WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('Vorgang nicht gefunden.');

    res.setHeader('Content-Type', 'application/pdf');
    res.send('%PDF-1.4\n% Fake-PDF-Content\n... (Hier käme dein PDF)');
  } catch (err) {
    console.error('❌ Fehler beim Download:', err);
    res.status(500).send(err.message);
  }
});

// Fallback für alle anderen Routen
app.use((req, res) => {
  res.status(404).send('Route nicht gefunden');
});

// Start Server
const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => console.log(`✅ API läuft unter http://localhost:${port}`));

// Init DB beim Start
initDB();