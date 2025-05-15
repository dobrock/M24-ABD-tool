#!/bin/bash

# ------------------------------
# Konfiguration: manuell je nach Bedarf ändern
# ------------------------------

# Lokale API (Home)
LOCAL_API_URL="http://localhost:3001"

# Render API (Live)
RENDER_API_URL="https://m24-abd-tool-v1-1-api.onrender.com"

# Umschalten zwischen lokal und Render (manuell oder per Flag)
USE_LOCAL=true

# ------------------------------
# Interner Setup
# ------------------------------
if $USE_LOCAL; then
  API_URL="$LOCAL_API_URL"
else
  API_URL="$RENDER_API_URL"
fi

echo "🔧 API Debug gestartet"
echo "🌍 Modus: $(if $USE_LOCAL; then echo 'LOKAL'; else echo 'RENDER'; fi)"
echo "🔗 API URL: $API_URL"

# ------------------------------
# Lokaler Port-Check (nur bei LOCAL)
# ------------------------------
if $USE_LOCAL; then
  echo "➡️ Prüfen ob Port 3001 offen ist..."
  lsof -i :3001
  if [ $? -ne 0 ]; then
    echo "❗ Warnung: Kein Prozess hört auf Port 3001"
  fi

  echo "➡️ Prüfen ob SQLite Datei existiert (./server/vorgaenge.db)..."
  if [ -f "./server/vorgaenge.db" ]; then
    echo "✅ SQLite gefunden"
  else
    echo "❗ Achtung: ./server/vorgaenge.db NICHT gefunden"
  fi
fi

# ------------------------------
# Curl Tests
# ------------------------------
echo "➡️ CURL Test auf /api/vorgaenge..."
curl -s -w "\n➡️ HTTP Status: %{http_code}\n" "$API_URL/api/vorgaenge" || echo "❌ CURL fehlgeschlagen"

echo "➡️ CURL Test auf /api/vorgang (POST Dummy)..."
RESPONSE=$(curl -s -X POST "$API_URL/api/vorgang" -H "Content-Type: application/json" -d '{"mrn":"TEST123","empfaenger":"M24","land":"DE","waren":"Testwaren"}')
echo "Antwort: $RESPONSE"

# ------------------------------
echo "✅ Debug abgeschlossen."
