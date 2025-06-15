const path = require('path');
const { uploadToWasabi } = require('../utils/uploadToWasabi');
const fs = require('fs');

async function handleUploadWithWasabi(vorgangsId, dateiname) {
  try {
    const localPath = path.join(__dirname, '..', 'uploads', vorgangsId, dateiname);
    const wasabiKey = `${vorgangsId}/${dateiname}`;

    const publicUrl = await uploadToWasabi(localPath, wasabiKey);
    console.log('✅ Datei an Wasabi gesendet:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Fehler beim Hochladen zu Wasabi:', error);
    return null;
  }
}

module.exports = { handleUploadWithWasabi };
