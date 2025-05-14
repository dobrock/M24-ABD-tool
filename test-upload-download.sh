#!/bin/bash

# Korrekte API-URL (Backend)
API_URL="https://m24-abd-tool-v1-1-api.onrender.com/api/vorgaenge"

echo "➡️  Anlegen neuer Vorgang..."
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"empfaenger": "Muster GmbH", "land": "USA", "mrn": "MRN-987654321", "notizen": "Test für Upload und Download"}')

echo "Antwort: $RESPONSE"
ID=$(echo "$RESPONSE" | jq -r '.id // empty')
if [[ -z "$ID" ]]; then
  echo "❌ Fehler beim Anlegen des Vorgangs"
  exit 1
fi

echo "✅ Vorgang angelegt mit ID: $ID"
echo

for doc in pdf rechnung abd agv; do
  echo "➡️  Test: $doc hochladen"
  curl -s -X POST "$API_URL/$ID/upload/$doc" \
    -F "file=@test-files/test-$doc.pdf" | jq
  echo
done

echo "➡️  Prüfung: Vorgang abrufen"
curl -s "$API_URL/$ID" | jq
echo

echo "➡️  Test: Downloads prüfen (nur Header Check)"
for doc in pdf rechnung abd agv; do
  echo "$doc:"
  curl -s -I "$API_URL/$ID/download/$doc" | grep HTTP
  echo
done

echo "✅ Upload- & Download-Test abgeschlossen."