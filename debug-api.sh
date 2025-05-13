#!/bin/bash

API_URL="https://m24-abd-tool-v1-1.onrender.com"

echo "➡️  Prüfen: API-Status..."
curl -s -I "$API_URL" | grep HTTP
echo

echo "➡️  Prüfen: Vorgang anlegen..."
RESPONSE=$(curl -s -X POST $API_URL/api/vorgaenge \
  -H "Content-Type: application/json" \
  -d '{"empfaenger": "Muster GmbH", "land": "USA", "mrn": "MRN-987654321", "notizen": "Debug Test"}')

echo "Antwort:"
echo "$RESPONSE" | head -c 200
echo

ID=$(echo $RESPONSE | jq -r '.id')

if [[ "$ID" == "null" || -z "$ID" ]]; then
  echo "❌ Fehler: Kein gültiges JSON oder .id fehlt!"
  exit 1
fi

echo "✅ Vorgang erfolgreich angelegt mit ID: $ID"
echo

echo "➡️  Prüfen: Download-Endpunkte (nur Header Check)"
for doc in pdf rechnung abd agv; do
  echo "$doc:"
  curl -s -I "$API_URL/api/vorgaenge/$ID/download/$doc" | grep HTTP
  echo
done

echo "✅ Debug-Check abgeschlossen."