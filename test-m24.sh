#!/bin/bash

# API und Frontend URLs anpassen (Render + Vercel)
API_URL="https://m24-abd-tool.onrender.com/api/vorgaenge"
FRONTEND_BASE="https://m24-abd-tool.vercel.app"

echo "=== API TEST: Render Backend ==="
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)
if [ "$response" -eq 200 ]; then
  echo "✅ API erreichbar (Status $response)"
  count=$(curl -s $API_URL | jq length)
  if [ "$count" -gt 0 ]; then
    echo "✅ API liefert Daten: $count Vorgang/Vorgänge"
  else
    echo "⚠️  API erreichbar, aber keine Daten"
  fi
else
  echo "❌ API Fehler (Status $response)"
fi

echo ""
echo "=== Frontend TEST: Startseite ==="
curl -s -o /dev/null -w "%{http_code}\n" $FRONTEND_BASE | grep 200 && echo "✅ OK" || echo "❌ FEHLER"

echo ""
echo "=== Frontend TEST: /vorgaenge ==="
curl -s -o /dev/null -w "%{http_code}\n" $FRONTEND_BASE/vorgaenge | grep 200 && echo "✅ OK" || echo "❌ FEHLER"

echo ""
echo "=== Frontend TEST: /verwaltung ==="
curl -s -o /dev/null -w "%{http_code}\n" $FRONTEND_BASE/verwaltung | grep 200 && echo "✅ OK" || echo "❌ FEHLER"

echo ""
echo "=== Test abgeschlossen ==="