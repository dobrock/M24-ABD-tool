#!/bin/bash
echo "➡️  Anlegen neuer Vorgang..."
RESPONSE=$(curl -s -X POST https://m24-abd-tool.onrender.com/api/vorgang \
  -H "Content-Type: application/json" \
  -d '{
    "empfaenger": "Muster GmbH",
    "land": "USA",
    "mrn": "MRN-987654321",
    "notizen": "Test für Upload und Download"
  }')

ID=$(echo $RESPONSE | jq -r '.id')
echo "✅ Vorgang angelegt mit ID: $ID"

echo "➡️  Test: PDF hochladen"
curl -s -X POST https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/upload/pdf \
  -F "file=@test-files/test-pdf.pdf"

echo "➡️  Test: Rechnung hochladen"
curl -s -X POST https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/upload/rechnung \
  -F "file=@test-files/test-invoice.pdf"

echo "➡️  Test: ABD hochladen"
curl -s -X POST https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/upload/abd \
  -F "file=@test-files/test-abd.pdf"

echo "➡️  Test: AGV hochladen"
curl -s -X POST https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/upload/agv \
  -F "file=@test-files/test-agv.pdf"

echo "➡️  Prüfung: Vorgang abrufen"
curl -s https://m24-abd-tool.onrender.com/api/vorgang/$ID | jq

echo "➡️  Test: Downloads prüfen"
echo "PDF:"
curl -I https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/download/pdf

echo "Rechnung:"
curl -I https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/download/rechnung

echo "ABD:"
curl -I https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/download/abd

echo "AGV:"
curl -I https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/download/agv

echo "✅ Upload- & Download-Test abgeschlossen."