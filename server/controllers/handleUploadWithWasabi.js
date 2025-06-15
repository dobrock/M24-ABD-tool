const path = require('path');
const fs = require('fs');
const { uploadToWasabi } = require('./uploadToWasabi');

async function handleUploadWithWasabi(vorgangsId, dateiname) {
  try {
    const localPath = path.join(__dirname, '..', 'uploads', vorgangsId, dateiname);
    const wasabiKey = `${vorgangsId}/${dateiname}`;

    if (!fs.existsSync(localPath)) {
      throw new Error(`Datei nicht gefunden: ${localPath}`);
    }

    const publicUrl = await uploadToWasabi(localPath, wasabiKey);
    console.log('✅ Datei an Wasabi gesendet:', publicUrl);

    // Datei optional löschen
    fs.unlinkSync(localPath);

    return publicUrl;
  } catch (error) {
    console.error('❌ Fehler beim Hochladen zu Wasabi:', error.message);
    return null;
  }
}

module.exports = { handleUploadWithWasabi };