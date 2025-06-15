const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const { buildFilename } = require('./utils/filenameHelpers');
const { handleUploadWithWasabi } = require('./utils/handleUploadWithWasabi');

// ✅ Multer-Konfiguration für Dateiuploads
const multer = require('multer');

// Für Uploads mit Vorgangs-ID (z. B. /api/vorgaenge/:id/upload/generic)
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const vorgangId = req.params.id;
    if (!vorgangId) {
      return cb(new Error('Vorgangs-ID fehlt'), null);
    }
    const dir = path.join(__dirname, 'uploads', vorgangId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const fileUpload = multer({ storage: fileStorage });

// Für temporäre Uploads ohne ID (z. B. beim Anlegen des Vorgangs)
const uploadTemp = multer({ storage: multer.memoryStorage() }); // ✅ Puffer im RAM – wichtig für PDF-Upload zu Wasabi

console.log("🧪 AWS Access Key:", process.env.S3_ACCESS_KEY_ID);
console.log("🧪 AWS Secret Key:", process.env.S3_SECRET_ACCESS_KEY);
console.log("🧪 AWS Region:", process.env.S3_REGION);
console.log("🧪 AWS Endpoint:", process.env.S3_ENDPOINT);

console.log('🌍 Loaded Region:', process.env.S3_REGION);

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
  app.post('/api/vorgaenge', uploadTemp.any(), async (req, res) => {
    console.log('📨 Daten empfangen:', req.body);
  
    const id = uuidv4();
    let parsedData = {};
  
    try {
      parsedData = JSON.parse(req.body.data);
      console.log('✅ parsedData erfolgreich geparst:', parsedData);
      console.log('🔍 notizen-Wert aus parsedData:', parsedData.notizen);
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

      // ✅ Neue, sprechende Dateinamen
      const kunde = parsedData.recipient?.name?.trim() || 'Unbekannt';
      const rechnungsnummer = parsedData.invoiceNumber;
      const vorgangsId = id; // = generierte UUID

      // Atlas-PDF
      const atlasName = buildFilename({ typ: 'pdf', kunde, rechnungsnummer });
      const atlasUrl = await handleUploadWithWasabi(vorgangsId, atlasName);

      // Rechnung
      const invoiceName = buildFilename({ typ: 'rechnung', kunde, rechnungsnummer });
      const invoiceUrl = await handleUploadWithWasabi(vorgangsId, invoiceName);

      // ABD
      const abdName = buildFilename({ typ: 'abd', kunde, rechnungsnummer, mrn });
      const abdUrl = await handleUploadWithWasabi(vorgangsId, abdName);

      // AGV
      const agvName = buildFilename({ typ: 'agv', kunde, rechnungsnummer, mrn });
      const agvUrl = await handleUploadWithWasabi(vorgangsId, agvName);

  
      // 📁 PDF automatisch anlegen oder speichern
      const today = new Date().toISOString().slice(0, 10);
      const safeEmpfaenger = parsedData.recipient?.name?.replace(/\s+/g, '-');
      const fileBasename = `${safeEmpfaenger}-${today}.pdf`;
      const uploadsDir = path.join(__dirname, 'uploads', id);
      const atlasPath = path.join(uploadsDir, fileBasename);
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  
      try {
        const uploadedPdf = req.files?.find(f => f.fieldname === 'pdf');
        if (uploadedPdf?.buffer?.length > 0) {
          fs.writeFileSync(atlasPath, uploadedPdf.buffer);
          console.log(`✅ PDF gespeichert unter: ${atlasPath}`);
        } else {
          throw new Error('Keine gültige PDF-Datei vorhanden');
        }
      } catch (err) {
        console.warn('⚠️ Keine PDF-Datei im Upload gefunden oder kein Buffer verfügbar, Dummy wird erzeugt');
        fs.writeFileSync(atlasPath, `PDF-Inhalt für ${safeEmpfaenger}, erstellt am ${today}`);
      }
      
      // ✅ NEU: Upload nach Wasabi (wenn aktiv)
      if (process.env.USE_S3 === 'true') {
        try {
          const { handleUploadWithWasabi } = require('./utils/handleUploadWithWasabi');
          const publicUrl = await handleUploadWithWasabi(id, fileBasename);
          console.log('✅ Atlas-PDF zu Wasabi hochgeladen:', publicUrl);
      
          // Datenbankeintrag ergänzen
          await pool.query(`
            INSERT INTO uploads (id, vorgang_id, typ, dateiname, url, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
          `, [
            uuidv4(),
            id,
            'pdf',
            fileBasename,
            publicUrl
          ]);
        } catch (err) {
          console.error('❌ Fehler beim Wasabi-Upload der Atlas-PDF:', err);
        }
      }      

      res.json({ success: true, id }); // ✅ letzter regulärer Block

    } catch (err) {
      console.error('❌ Fehler beim Anlegen des Vorgangs:', err);
      res.status(500).send(err.message);
    }
  }); // ✅ GANZ WICHTIG: schließt app.post('/api/vorgaenge'...

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

// Tabelle für Notizen erstellen
const initNotizenTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notizen (
        id UUID PRIMARY KEY,
        titel TEXT NOT NULL,
        beschreibung TEXT NOT NULL,
        erstellt_am TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabelle notizen bereit.');
  } catch (err) {
    console.error('❌ Fehler beim Initialisieren der Notizen-Tabelle:', err);
  }
};


// POST /api/notizen – Neue Notiz anlegen
app.post('/api/notizen', async (req, res) => {
  const { titel, beschreibung } = req.body;
  const id = uuidv4();
  try {
    await pool.query(
      `INSERT INTO notizen (id, titel, beschreibung) VALUES ($1, $2, $3)`,
      [id, titel, beschreibung]
    );
    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('❌ Fehler beim Speichern der Notiz:', err);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

// GET /api/notizen – Alle Notizen abrufen
app.get('/api/notizen', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notizen ORDER BY erstellt_am DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Fehler beim Abrufen der Notizen:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen' });
  }
});

// Tabelle für VersionsProtokoll erstellen
const initProtokollTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS protokoll (
        id UUID PRIMARY KEY,
        version TEXT NOT NULL,
        beschreibung TEXT,
        erstellt_am TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabelle protokoll bereit.');
  } catch (err) {
    console.error('❌ Fehler beim Anlegen der Tabelle protokoll:', err);
  }
};

const initUploadsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS uploads (
        id UUID PRIMARY KEY,
        vorgang_id UUID REFERENCES vorgaenge(id) ON DELETE CASCADE,
        typ TEXT NOT NULL,
        dateiname TEXT NOT NULL,
        url TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT NOW(),
        archiv_loeschdatum TIMESTAMP
      )
    `);
    console.log('✅ Tabelle uploads bereit.');
  } catch (err) {
    console.error('❌ Fehler beim Anlegen der Tabelle uploads:', err);
  }
};

// 🔽 Protokoll: Alle abrufen
app.get('/api/protokoll', async (req, res) => {
  const result = await pool.query('SELECT * FROM protokoll ORDER BY erstellt_am DESC');
  res.json(result.rows);
});

// 🔼 Protokoll: Neuen Eintrag anlegen
app.post('/api/protokoll', async (req, res) => {
  const { version, beschreibung } = req.body;
  const id = uuidv4();
  await pool.query(
    'INSERT INTO protokoll (id, version, beschreibung) VALUES ($1, $2, $3)',
    [id, version, beschreibung]
  );
  res.status(201).json({ id });
});

// ✏️ Protokoll: Bearbeiten
app.patch('/api/protokoll/:id', async (req, res) => {
  const { id } = req.params;
  const { version, beschreibung } = req.body;
  await pool.query(
    'UPDATE protokoll SET version = $1, beschreibung = $2 WHERE id = $3',
    [version, beschreibung, id]
  );
  res.sendStatus(204);
});

// 🗑️ Protokoll: Löschen
app.delete('/api/protokoll/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM protokoll WHERE id = $1', [id]);
  res.sendStatus(204);
});

// GET /api/vorgaenge
app.get('/api/vorgaenge', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM vorgaenge ORDER BY erstelldatum DESC`);
    const vorgaenge = await Promise.all(result.rows.map(async (row) => {
      const uploadsResult = await pool.query(`SELECT * FROM uploads WHERE vorgang_id = $1`, [row.id]);
      return {
        ...row,
        uploads: uploadsResult.rows,
        formdata: row.formdata || {},
      };
    }));
    res.json(vorgaenge);
  } catch (err) {
    console.error('❌ Fehler beim Laden der Vorgänge:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Vorgänge' });
  }
});

// GET /api/vorgaenge/:id
app.get('/api/vorgaenge/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM vorgaenge WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('Nicht gefunden');

    const vorgang = result.rows[0];

    // 🆕 Hochgeladene Dateien aus DB-Tabelle `uploads` abrufen
    const uploads = await pool.query(
      'SELECT * FROM uploads WHERE vorgang_id = $1 ORDER BY uploaded_at DESC',
      [req.params.id]
    );

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

      } else {
      console.log('📭 Kein Upload-Verzeichnis vorhanden');
      }

// ✅ Wenn S3 aktiv ist, ergänze ggf. fehlende URLs
if (process.env.USE_S3 === 'true') {
  const bucket = process.env.S3_BUCKET;
  const baseUrl = process.env.S3_ENDPOINT;
  const s3Prefix = `${baseUrl}/${bucket}/${vorgang.id}`;

  if (!files.agv && vorgang?.formdata?.invoiceNumber) {
    files.agv = `${s3Prefix}/AGV_${vorgang.formdata.invoiceNumber}.pdf`;
  }

  if (!files.abd && vorgang?.formdata?.invoiceNumber) {
    files.abd = `${s3Prefix}/ABD_${vorgang.formdata.invoiceNumber}.pdf`;
  }

  if (!files.invoice && vorgang?.formdata?.invoiceNumber) {
    files.invoice = `${s3Prefix}/Rg_${vorgang.formdata.invoiceNumber}.pdf`;
  }
}

    res.json({
      ...vorgang,
      files,
      uploads: uploads.rows, 
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

app.post('/api/vorgaenge/:id/upload/generic', fileUpload.single('file'), async (req, res) => {
  const vorgangId = req.params.id;
  const originalFilename = req.file.originalname;
  const labelRaw = req.body?.label;

  console.log('🧪 label received:', labelRaw);
  const label = Array.isArray(labelRaw) ? labelRaw[0] : (typeof labelRaw === 'string' ? labelRaw : 'generic');
  const safeLabel = label.toLowerCase().replace(/\s+/g, '-');

  const file = req.file;

  // 🧬 Vorgang laden, um Rechnungsnummer/MRN zu erhalten
  const result = await pool.query(`SELECT * FROM vorgaenge WHERE id = $1`, [vorgangId]);
  const vorgang = result.rows[0];
  let empfaenger = 'Empfaenger';
let rechnungsnummer = 'Unbekannt';

try {
  const formdata = vorgang?.formdata ? JSON.parse(JSON.stringify(vorgang.formdata)) : {};
  empfaenger = formdata?.recipient?.name?.replace(/\s+/g, '-') || empfaenger;
  rechnungsnummer = formdata?.invoiceNumber || rechnungsnummer;
} catch (err) {
  console.warn('⚠️ formdata konnte nicht interpretiert werden:', err.message);
}

  const erstellDatum = new Date(vorgang.erstelldatum).toISOString().slice(0, 10);
  const mrn = vorgang?.mrn || null;
  
  console.log('🧪 Rechnungsnummer:', rechnungsnummer);
  console.log('🧪 MRN:', mrn);
  console.log('🧪 Label:', label);
  
    // 🔀 Dateinamen definieren
    let filename = 'datei.pdf';

    if (label.toLowerCase().includes('atlas')) {
      filename = `${empfaenger}-${erstellDatum}.pdf`;
    } else if (label.toLowerCase().includes('rechnung')) {
      filename = `Rg_${rechnungsnummer}.pdf`;
    } else if (label.toLowerCase().includes('ausfuhrbegleitdokument')) {
      filename = mrn
        ? `ABD_${mrn}_${rechnungsnummer}.pdf`
        : `ABD_${rechnungsnummer}.pdf`;
    } else if (label.toLowerCase().includes('ausgangsvermerk')) {
      filename = mrn
        ? `AGV_${mrn}_${rechnungsnummer}.pdf`
        : `AGV_${rechnungsnummer}.pdf`;
    } else {
      filename = `${label}.pdf`;
    }
  
    console.log('🧪 USE_S3:', process.env.USE_S3);
    if (process.env.USE_S3 === 'true') {
      const s3Key = `${vorgangId}/${filename}`;
      try {
        const oldPath = file.path;
        const newPath = path.join(path.dirname(oldPath), filename.replace(/[^\w.\-_]/g, '_'));
        fs.renameSync(oldPath, newPath); // ✅ Umbenennen

        const publicUrl = await handleUploadWithWasabi(vorgangId, path.basename(newPath)); // ✅ Hochladen
        console.log('✅ Datei zu Wasabi hochgeladen:', publicUrl);

        // 🔽 🆕 Upload in Datenbank eintragen
        await pool.query(
          `INSERT INTO uploads (id, vorgang_id, typ, dateiname, url, uploaded_at, archiv_loeschdatum)
           VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
          [
            uuidv4(),
            vorgangId,
            label,
            filename,
            publicUrl,
            label.toLowerCase().includes('ausgangsvermerk') || label.toLowerCase().includes('agv')
            ? new Date(Date.now() + 6 * 365 * 24 * 60 * 60 * 1000)
            : null
          ]
        );
    
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

        // Datei lokal entfernen
        fs.unlinkSync(newPath); // ✅ Jetzt löschen
    
        return res.json({ success: true, url: publicUrl });
      } catch (err) {
        console.error('❌ Fehler beim Upload zu Wasabi:', err);
        return res.status(500).json({ error: 'Wasabi-Upload fehlgeschlagen' });
      }
    }    

if (!file) return res.status(400).json({ error: 'Keine Datei empfangen' });

try {
  const uploadsDir = path.join(__dirname, 'uploads', vorgangId);
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

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
app.get('/download/:id/:filename', (req, res) => {
  const { id, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', id, filename);

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

// GET /api/notizen – alle Notizen abrufen
app.get('/api/notizen', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM notizen ORDER BY erstellt_am DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Fehler beim Laden der Notizen:', err);
    res.status(500).send('Fehler beim Laden');
  }
});

// POST /api/notizen – neue Notiz speichern
app.post('/api/notizen', async (req, res) => {
  const { titel, beschreibung } = req.body;
  if (!titel || !beschreibung) return res.status(400).json({ error: 'Titel oder Beschreibung fehlt' });

  const id = uuidv4();
  try {
    await pool.query(
      `INSERT INTO notizen (id, titel, beschreibung) VALUES ($1, $2, $3)`,
      [id, titel, beschreibung]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error('❌ Fehler beim Speichern:', err);
    res.status(500).send('Fehler beim Speichern');
  }
});

// PATCH /api/notizen/:id – bestehende Notiz bearbeiten
app.patch('/api/notizen/:id', async (req, res) => {
  const { id } = req.params;
  const { titel, beschreibung } = req.body;
  try {
    await pool.query(
      `UPDATE notizen SET titel = $1, beschreibung = $2 WHERE id = $3`,
      [titel, beschreibung, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Fehler beim Aktualisieren:', err);
    res.status(500).send('Fehler beim Bearbeiten');
  }
});

// DELETE /api/notizen/:id – Notiz löschen
app.delete('/api/notizen/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM notizen WHERE id = $1`, [id]);
    res.status(204).send();
  } catch (err) {
    console.error('❌ Fehler beim Löschen:', err);
    res.status(500).send('Fehler beim Löschen');
  }
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
// GET /api/notizen
app.get('/api/notizen', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM notizen ORDER BY erstellt DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Fehler beim Laden der Notizen:', err);
    res.status(500).send(err.message);
  }
});

// POST /api/notizen
app.post('/api/notizen', async (req, res) => {
  const { titel, beschreibung } = req.body;
  if (!titel || !beschreibung) {
    return res.status(400).json({ error: 'Titel und Beschreibung erforderlich' });
  }

  try {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO notizen (id, titel, beschreibung, erstellt)
       VALUES ($1, $2, $3, NOW())`,
      [id, titel, beschreibung]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Fehler beim Speichern der Notiz:', err);
    res.status(500).send(err.message);
  }
});

// PATCH /api/notizen/:id
app.patch('/api/notizen/:id', async (req, res) => {
  const { id } = req.params;
  const { titel, beschreibung } = req.body;
  if (!titel || !beschreibung) {
    return res.status(400).json({ error: 'Titel und Beschreibung erforderlich' });
  }

  try {
    await pool.query(
      `UPDATE notizen SET titel = $1, beschreibung = $2 WHERE id = $3`,
      [titel, beschreibung, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Fehler beim Aktualisieren der Notiz:', err);
    res.status(500).send(err.message);
  }
});

// DELETE /api/notizen/:id
app.delete('/api/notizen/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM notizen WHERE id = $1`, [id]);
    res.status(204).send();
  } catch (err) {
    console.error('❌ Fehler beim Löschen der Notiz:', err);
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

app.listen(port, '0.0.0.0', () => console.log(`✅ API läuft unter http://localhost:${port}`));

// Init DB
initDB();
initNotizenTable();
initProtokollTable(); 
initUploadsTable();