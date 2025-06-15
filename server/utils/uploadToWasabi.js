const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

console.log("🧪 AWS Access Key:", process.env.S3_ACCESS_KEY_ID);
console.log("🧪 AWS Secret Key:", process.env.S3_SECRET_ACCESS_KEY);
console.log("🧪 AWS Region:", process.env.S3_REGION);
console.log("🧪 AWS Endpoint:", process.env.S3_ENDPOINT);

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
});

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

async function uploadToWasabi(filePath, key) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Datei nicht gefunden: ${filePath}`);
    }

    const fileStream = fs.createReadStream(filePath);
    const contentType = getContentType(filePath);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: fileStream,
      ContentType: contentType,

      // ⬇️ Damit die Datei öffentlich ist:
      ACL: 'public-read',
    });

    await s3.send(command);

    const publicUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
    console.log('✅ Datei erfolgreich zu Wasabi hochgeladen:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Fehler beim Upload zu Wasabi:', error.message);
    return null;
  }
}

module.exports = { uploadToWasabi };