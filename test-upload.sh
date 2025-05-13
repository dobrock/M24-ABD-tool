#!/bin/bash

# Dynamisch neue Test-ID anlegen
RESPONSE=$(curl -s -X POST https://m24-abd-tool-v1-1.onrender.com/api/vorgang \
  -H "Content-Type: application/json" \
  -d '{"empfaenger":"Muster GmbH","land":"USA","mrn":"MRN-987654321","notizen":"Testupload"}')

ID=$(echo $RESPONSE | jq -r '.id')
echo "✅ Vorgang angelegt mit ID: $ID"
echo

echo "➡️  Test: PDF hochladen"
curl -X POST https://m24-abd-tool-v1-1.onrender.com/api/vorgaenge/$ID/upload/pdf \
  -F "file=@test-files/test-pdf.pdf"
echo

echo "➡️  Test: Rechnung hochladen"
curl -X POST https://m24-abd-tool-v1-1.onrender.com/api/vorgaenge/$ID/upload/rechnung \
  -F "file=@test-files/test-rechnung.pdf"
echo

echo "➡️  Test: ABD hochladen"
curl -X POST https://m24-abd-tool-v1-1.onrender.com/api/vorgaenge/$ID/upload/abd \
  -F "file=@test-files/test-abd.pdf"
echo

echo "➡️  Test: AGV hochladen"
curl -X POST https://m24-abd-tool-v1-1.onrender.com/api/vorgaenge/$ID/upload/agv \
  -F "file=@test-files/test-agv.pdf"
echo

echo "➡️  Prüfung: Vorgang abrufen"
curl -s https://m24-abd-tool-v1-1.onrender.com/api/vorgang/$ID | jq
echo


echo "➡️  Test: Downloads prüfen"
download_errors=0
for doc in pdf rechnung abd agv; do
  echo "$doc:"
  # Prüfe Header mit curl -I, erwarte HTTP 200
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -I https://m24-abd-tool-v1-1.onrender.com/api/vorgaenge/$ID/download/$doc)
  if [ "$STATUS" == "200" ]; then
    echo "✅ $doc Download OK"
  else
    echo "❌ $doc Download fehlgeschlagen (Status $STATUS)"
    download_errors=$((download_errors + 1))
  fi
  echo
done

if [ $download_errors -eq 0 ]; then
  echo "✅ Upload- & Download-Test abgeschlossen: Alle Downloads erfolgreich."
else
  echo "❌ Upload- & Download-Test abgeschlossen: $download_errors Fehler beim Download."
fi