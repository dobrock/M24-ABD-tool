#!/bin/bash

# Korrekte API-URL (Backend)
API_URL="https://m24-abd-tool-v1-1-api.onrender.com"

echo "➡️  Anlegen neuer Vorgang..."
RESPONSE=$(curl -s -X POST $API_URL/api/vorgang \
  -H "Content-Type: application/json" \
  -d '{"empfaenger": "Muster GmbH", "land": "USA", "mrn": "MRN-987654321", "notizen": "Test für Upload und Download"}')

ID=$(echo $RESPONSE | jq -r '.id')
if [[ "$ID" == "null" || -z "$ID" ]]; then
  echo "❌ Fehler beim Anlegen des Vorgangs"
  exit 1
fi

echo "✅ Vorgang angelegt mit ID: $ID"

echo "➡️  Test: PDF hochladen"
curl -s -X POST "$API_URL/api/vorgaenge/$ID/upload/pdf" \
  -F "file=@test-files/test-pdf.pdf"
echo

echo "➡️  Test: Rechnung hochladen"
curl -s -X POST "$API_URL/api/vorgaenge/$ID/upload/rechnung" \
  -F "file=@test-files/test-rechnung.pdf"
echo

echo "➡️  Test: ABD hochladen"
curl -s -X POST "$API_URL/api/vorgaenge/$ID/upload/abd" \
  -F "file=@test-files/test-abd.pdf"
echo

echo "➡️  Test: AGV hochladen"
curl -s -X POST "$API_URL/api/vorgaenge/$ID/upload/agv" \
  -F "file=@test-files/test-agv.pdf"
echo

echo "➡️  Prüfung: Vorgang abrufen"
curl -s "$API_URL/api/vorgang/$ID" | jq
echo

echo "➡️  Test: Downloads prüfen"
echo "PDF:"
curl -s -I "$API_URL/api/vorgaenge/$ID/download/pdf"
echo

echo "Rechnung:"
curl -s -I "$API_URL/api/vorgaenge/$ID/download/rechnung"
echo

echo "ABD:"
curl -s -I "$API_URL/api/vorgaenge/$ID/download/abd"
echo

echo "AGV:"
curl -s -I "$API_URL/api/vorgaenge/$ID/download/agv"
echo

echo "✅ Upload- & Download-Test abgeschlossen."