#!/bin/bash

# ------------------------------
# Konfiguration
# ------------------------------
LOCAL_API="http://localhost:3001/api/vorgaenge"
RENDER_API="https://m24-abd-tool-v1-1-api.onrender.com/api/vorgaenge"

# ------------------------------
# Funktion: Test API und Ausgabe
# ------------------------------
test_api() {
    local URL=$1
    local NAME=$2

    echo "➡️ Test $NAME: $URL"
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$URL" || echo "❌ CURL Fehler")
    BODY=$(echo "$RESPONSE" | sed -n '/HTTP_STATUS:/!p')
    STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)

    echo "🔗 Status: $STATUS"
    echo "📦 Antwort: $BODY"
    echo ""
}

# ------------------------------
# Tests durchführen
# ------------------------------
echo "==============================="
echo "🔍 Vergleiche LOCAL vs. RENDER"
echo "==============================="

echo "🔧 Test LOCAL API:"
test_api "$LOCAL_API" "LOCAL API"

echo "🔧 Test RENDER API:"
test_api "$RENDER_API" "RENDER API"

echo "==============================="
echo "✅ Vergleich abgeschlossen"
