const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const multer = require('multer');
const upload = multer();
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

console.log('📦 Verbinde mit PG:', process.env.PG_CONNECTION);

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION,
  ssl: { rejectUnauthorized: false }
});

// Tabelle erstellen
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
        notizen TEXT,
        formdata JSONB
      )
    `);
    console.log('✅ Tabelle vorgaenge bereit.');
  } catch (err) {
    console.error('❌ Fehler beim Initialisieren der Datenbank:', err);
  }
};

// POST /api/vorgaenge
app.post('/api/vorgaenge', upload.any(), async (req, res) => {
  console.log('📨 Daten empfangen:', req.body);

  const id = uuidv4();
  let parsedData = {};

  try {
    parsedData = JSON.parse(req.body.data);
    console.log('✅ parsedData erfolgreich geparst:', parsedData);
  } catch (err) {
    console.error('❌ Fehler beim Parsen von req.body.data:', err.message);
    return res.status(400).json({ error: 'Ungültiges JSON im data-Feld' });
  }

  try {
    const { invoiceNumber, recipient, items, createdAt, fileName, status, notizen } = parsedData;
    const waren = Array.isArray(items) ? items.map(item => item.description).join(', ') : '';
    const empfaenger = recipient?.name || '';
    const land = recipient?.country || '';
    const mrn = parsedData.mrn || null;

    await pool.query(
      `INSERT INTO vorgaenge (
        id, erstelldatum, mrn, empfaenger, land, waren, status, notizen, formdata
      ) VALUES (
        $1, NOW(), $2, $3, $4, $5, $6, $7, $8
      )`,
      [
        id,
        mrn,
        empfaenger,
        land,
        waren,
        status || 'angelegt',
        notizen || '',
        parsedData
      ]
    );

    res.json({ success: true, id });
  } catch (err) {
    console.error('❌ Fehler beim Anlegen des Vorgangs:', err);
    res.status(500).send(err.message);
  }
});

// POST /api/backup
app.post('/api/backup', (req, res) => {
  const timestamp = new Date().toISOString().slice(0,10).replace(/-/g, "_");
  const filename = `backup_m24_abd_${timestamp}.dump`;
  const filepath = path.join('/tmp', filename);

  const cmd = `pg_dump -Fc -d "${process.env.PG_CONNECTION}" > ${filepath}`;
  exec(cmd, (error) => {
    if (error) {
      console.error("❌ Backup-Fehler:", error);
      return res.status(500).json({ error: 'Backup fehlgeschlagen' });
    }

    console.log("✅ Backup erfolgreich:", filepath);
    res.download(filepath, filename, (err) => {
      if (err) console.error("❌ Fehler beim Download:", err);
      fs.unlink(filepath, () => {});
    });
  });
});

// GET /api/vorgaenge
app.get('/api/vorgaenge', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM vorgaenge ORDER BY erstelldatum DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Fehler beim Abrufen:', err);
    res.status(500).send(err.message);
  }
});

// GET /api/vorgaenge/:id
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

// PATCH /api/vorgaenge/:id/status
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

// PATCH /api/vorgaenge/:id (MRN ändern)
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

// DELETE /api/vorgaenge/:id
app.delete('/api/vorgaenge/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM vorgaenge WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

// Fallback
app.use((req, res) => {
  res.status(404).send('Route nicht gefunden');
});

// Server starten
const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => console.log(`✅ API läuft unter http://localhost:${port}`));

// Init DB
initDB();
