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
    
    // 📁 Upload-Ordner automatisch anlegen
    const uploadsDir = path.join(__dirname, 'uploads', id);
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    
    // 📄 Atlas-PDF automatisch erstellen
    const safeEmpfaenger = empfaenger.replace(/\s+/g, '-') || 'Empfaenger';
    const erstelldatum = new Date().toISOString().slice(0, 10);
    const atlasFilename = `${safeEmpfaenger}-${erstelldatum}.pdf`;
    const atlasPath = path.join(uploadsDir, atlasFilename);
    
    const uploadedPdf = req.files?.find(f => f.fieldname === 'pdf');

    if (uploadedPdf) {
      fs.writeFileSync(atlasPath, uploadedPdf.buffer);
      console.log(`✅ Generierte Atlas-PDF gespeichert unter: ${atlasPath}`);
    } else {
      console.warn('⚠️ Keine PDF-Datei im Upload gefunden, Dummy wird erzeugt');
      fs.writeFileSync(atlasPath, `PDF-Inhalt für ${empfaenger}, erstellt am ${erstelldatum}`);
    }

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

    const vorgang = result.rows[0];

    // Dateien aus dem Upload-Ordner simulieren
    const uploadsDir = path.join(__dirname, 'uploads', vorgang.id);
    let files = {};

    if (fs.existsSync(uploadsDir)) {
      const filenames = fs.readdirSync(uploadsDir);
      filenames.forEach((filename) => {
        const lower = filename.toLowerCase();
        if (lower.includes('atlas') || lower.match(/^[\w-]+-\d{4}-\d{2}-\d{2}\.pdf$/)) {
          files.pdf = `/uploads/${vorgang.id}/${filename}`;
        }        
        else if (lower.includes('rg_')) files.invoice = `/uploads/${vorgang.id}/${filename}`;
        else if (lower.includes('abd_')) files.abd = `/uploads/${vorgang.id}/${filename}`;
        else if (lower.includes('agv_')) files.agv = `/uploads/${vorgang.id}/${filename}`;
      });

      console.log('🧪 Gefundene Dateien im Ordner:', files);
}

    res.json({
      ...vorgang,
      files,
    });
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
    res.json({ success: true }); // ✅ <- das ist wichtig
  } catch (err) {
    console.error('❌ Fehler beim Aktualisieren des Status:', err);
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

// 📥 Dateiupload für Vorgang
const fileUpload = multer({ dest: 'temp/' }); // Temporäres Ziel

app.post('/api/vorgaenge/:id/upload/generic', fileUpload.single('file'), async (req, res) => {
  const vorgangId = req.params.id;
  const labelRaw = req.body?.label;
  console.log('🧪 label received:', labelRaw);
  const label = Array.isArray(labelRaw) ? labelRaw[0] : (typeof labelRaw === 'string' ? labelRaw : 'generic');
  const safeLabel = label.toLowerCase().replace(/\s+/g, '-');

  const file = req.file;

  if (!file) return res.status(400).json({ error: 'Keine Datei empfangen' });

  try {
    const uploadsDir = path.join(__dirname, 'uploads', vorgangId);
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    // 🔍 lade Vorgang aus DB
    const result = await pool.query(`SELECT * FROM vorgaenge WHERE id = $1`, [vorgangId]);
    const vorgang = result.rows[0];
    const formdata = vorgang?.formdata || {};
    const empfaenger = formdata?.recipient?.name?.replace(/\s+/g, '-') || 'Empfaenger';
    const rechnungsnummer = formdata?.invoiceNumber || 'Unbekannt';
    const erstellDatum = new Date(vorgang.erstelldatum).toISOString().slice(0, 10); // z. B. 2025-06-01
    const mrn = vorgang.mrn;

    let filename = 'datei.pdf';

    // 🔀 Dateiname abhängig vom Label
    if (label.toLowerCase().includes('atlas')) {
      filename = `${empfaenger}-${erstellDatum}.pdf`;
    } else if (label.toLowerCase().includes('rechnung')) {
      filename = `Rg_${rechnungsnummer}.pdf`;
    } else if (label.toLowerCase().includes('ausfuhrbegleitdokument')) {
      filename = mrn ? `ABD_${mrn}.pdf` : `ABD_${rechnungsnummer}.pdf`;
    } else if (label.toLowerCase().includes('ausgangsvermerk')) {
      filename = mrn ? `AGV_${mrn}.pdf` : `AGV_${rechnungsnummer}.pdf`;
    } else {
      filename = `${label}.pdf`;
    }

    const targetPath = path.join(uploadsDir, filename.replace(/[^\w.\-_]/g, '_'));

    fs.renameSync(file.path, targetPath);
    console.log(`✅ Datei gespeichert unter: ${targetPath}`);

    // 📦 Status automatisch anpassen nach Upload
    try {
      const currentStatus = vorgang.status;
      const lower = filename.toLowerCase();

      console.log('📌 Erkenne Statusänderung...');
      console.log('📌 Filename:', lower);
      console.log('📌 Current Status:', currentStatus);

      if (lower.startsWith('abd_') && ['angelegt', 'ausfuhr_beantragt'].includes(currentStatus)) {
        await pool.query('UPDATE vorgaenge SET status = $1 WHERE id = $2', ['abd_erhalten', vorgangId]);
        console.log('✅ Status geändert auf abd_erhalten');
      }

      if (lower.startsWith('agv_')) {
        await pool.query('UPDATE vorgaenge SET status = $1 WHERE id = $2', ['agv_vorliegend', vorgangId]);
        console.log('✅ Status geändert auf agv_vorliegend');
      }
    } catch (err) {
      console.error('❌ Fehler bei Statusaktualisierung:', err);
    }

    res.json({ success: true, path: `/uploads/${vorgangId}/${encodeURIComponent(filename.replace(/[^\w.\-_]/g, '_'))}` });
  } catch (err) {
    console.error('❌ Fehler beim Speichern der Datei:', err);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

// 🧾 Eigene Route für Downloads (PDFs oder andere Dateien)
app.get('/download/:vorgangId/:filename', (req, res) => {
  const { vorgangId, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', vorgangId, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Datei nicht gefunden');
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('❌ Fehler beim Download:', err);
      res.status(500).send('Fehler beim Download');
    } else {
      console.log(`✅ Download erfolgreich: ${filename}`);
    }
  });
});

// 🆕 Statisches Ausliefern des /uploads-Ordners aktivieren
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Fallback
app.use((req, res) => {
  res.status(404).send('Route nicht gefunden');
});

// Server starten
const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => console.log(`✅ API läuft unter http://localhost:${port}`));

// Init DB
initDB();
