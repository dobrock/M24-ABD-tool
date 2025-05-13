#!/bin/bash

API_URL="https://m24-abd-tool.onrender.com/api"
STATUS_STEPS=("ausfuhr_beantragt" "abd_erhalten" "agv_vorliegend")

echo "=== 1. Anlegen Mustervorgang ==="
VORGANG_ID=$(curl -s -X POST $API_URL/vorgang \
  -H "Content-Type: application/json" \
  -d '{"empfaenger":"Max Mustermann","land":"USA","mrn":"22DE1234567890","notizen":"Automatischer Test"}' \
  | jq -r .id)

if [[ "$VORGANG_ID" == "null" || -z "$VORGANG_ID" ]]; then
  echo "❌ Fehler beim Anlegen des Vorgangs."
  exit 1
fi

echo "✅ Vorgang angelegt mit ID: $VORGANG_ID"

echo "=== 2. Status Schritt-für-Schritt wechseln ==="

for STATUS in "${STATUS_STEPS[@]}"
do
  echo "➡️  Wechsel zu: $STATUS"
  RESPONSE=$(curl -s -X PATCH $API_URL/vorgaenge/$VORGANG_ID/status \
    -H "Content-Type: application/json" \
    -d "{\"status\": \"$STATUS\"}")

  echo "🔄 Antwort: $RESPONSE"
  sleep 1
done

echo "=== 3. Vorgang prüfen ==="
curl -s -H "Accept: application/json" $API_URL/vorgang/$VORGANG_ID | jq .

echo "=== Test abgeschlossen ==="