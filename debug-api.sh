#!/bin/bash

# Konfigurierbare API-URL (Backend)
API_URL="https://m24-abd-tool-v1-1-api.onrender.com/api/vorgaenge"

echo "➡️  Prüfen: API-Status..."
curl -s -o /dev/null -w "%{http_code}\n" "$API_URL"
echo

echo "➡️  Anlegen neuer Vorgang..."
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"empfaenger": "Debug GmbH", "land": "USA", "mrn": "MRN-DEBUG-123", "notizen": "Debug API All-in-One"}')

echo "Antwort: $RESPONSE"
ID=$(echo "$RESPONSE" | jq -r '.id // empty')
if [[ -z "$ID" ]]; then
  echo "❌ Fehler: Kein Vorgang angelegt!"
  exit 1
fi

echo "✅ Vorgang erfolgreich angelegt mit ID: $ID"
echo

for doc in pdf rechnung abd agv; do
  echo "➡️  Upload: $doc"
  RESPONSE_UPLOAD=$(curl -s -X POST "$API_URL/$ID/upload/$doc" \
    -F "file=@test-files/test-$doc.pdf")
  echo "$RESPONSE_UPLOAD" | jq .
  echo
done

echo "➡️  Abruf: Vorgangsdaten prüfen"
curl -s "$API_URL/$ID" | jq .
echo

echo "➡️  Prüfung: Download-Endpunkte (nur Header Check)"
for doc in pdf rechnung abd agv; do
  echo "$doc:"
  curl -s -I "$API_URL/$ID/download/$doc" | grep HTTP
  echo
done

echo "✅ Debug-API All-in-One abgeschlossen."