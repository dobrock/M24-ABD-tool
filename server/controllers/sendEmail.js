const nodemailer = require('nodemailer');
const axios = require('axios');

exports.sendEmail = async (req, res) => {
  const { to, subject, text, attachments } = req.body;

  console.log('📧 Eingehende E-Mail-Anfrage:');
  console.log('Empfänger:', to);
  console.log('Betreff:', subject);
  console.log('Text:', text);
  console.log('Anzahl Anhänge:', attachments?.length);
  console.log('📨 Sende-Mail mit: ', process.env.SMTP_HOST, process.env.SMTP_USER);
  console.log('📎 Geplante Anhänge:');
attachments.forEach(a => console.log(`- ${a.name}: ${a.url}`));
  console.log('📨 Mail-Konfiguration:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    secure: false,
  });  

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // wichtig für Port 587 (STARTTLS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });     
    
    // 🧩 Hilfsfunktion oben einfügen (falls noch nicht geschehen)
    const checkFileExists = async (url) => {
      try {
        const response = await axios.head(url);
        return response.status === 200;
      } catch (error) {
        console.warn(`⚠️ Datei nicht erreichbar: ${url}`);
        return false;
      }
    };


    const files = await Promise.all(
      attachments.map(async (file) => {
        const fileOk = await checkFileExists(file.url);
        if (!fileOk) {
          console.warn(`🚫 Datei übersprungen: ${file.name} (${file.url})`);
          return null;
        }
    
        try {
          const response = await axios.get(file.url, { responseType: 'arraybuffer' });
          return {
            filename: file.name,
            content: response.data,
          };
        } catch (error) {
          console.error(`📛 Fehler beim Laden von ${file.name}:`, error.message);
          return null;
        }
      })
    );
    
    // filtere alle fehlgeschlagenen oder leeren Ergebnisse raus
    const filteredFiles = files.filter(f => f !== null);    

    await transporter.sendMail({
      from: `"Ausfuhr - MOTORSPORT24" <${process.env.SMTP_USER}>`,
      to: to || '',
      subject,
      text,
      attachments: filteredFiles,
    });      

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Fehler beim Mailversand:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
