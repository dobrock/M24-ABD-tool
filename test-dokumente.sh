#!/bin/bash

# Vorgangs-ID bitte anpassen (oder direkt aus dem Anlegen übernehmen)
ID="ecaccbc7-e0d6-45ca-9e24-c5db2ee27ff4"

echo "➡️ Setze PDF vorhanden..."
curl -X PUT https://m24-abd-tool.onrender.com/api/vorgaenge/$ID \
  -H "Content-Type: application/json" \
  -d '{"empfaenger":"Max Mustermann","land":"USA","mrn":"22DE1234567890","status":"angelegt","notizen":"Musterdatensatz Test","hasPdf":1,"hasInvoice":0,"hasAbd":0,"hasAgv":0}'

echo "➡️ Setze Rechnung vorhanden..."
curl -X PUT https://m24-abd-tool.onrender.com/api/vorgaenge/$ID \
  -H "Content-Type: application/json" \
  -d '{"empfaenger":"Max Mustermann","land":"USA","mrn":"22DE1234567890","status":"angelegt","notizen":"Musterdatensatz Test","hasPdf":1,"hasInvoice":1,"hasAbd":0,"hasAgv":0}'

echo "➡️ Setze ABD vorhanden..."
curl -X PUT https://m24-abd-tool.onrender.com/api/vorgaenge/$ID \
  -H "Content-Type: application/json" \
  -d '{"empfaenger":"Max Mustermann","land":"USA","mrn":"22DE1234567890","status":"angelegt","notizen":"Musterdatensatz Test","hasPdf":1,"hasInvoice":1,"hasAbd":1,"hasAgv":0}'

echo "➡️ Setze AGV vorhanden..."
curl -X PUT https://m24-abd-tool.onrender.com/api/vorgaenge/$ID \
  -H "Content-Type: application/json" \
  -d '{"empfaenger":"Max Mustermann","land":"USA","mrn":"22DE1234567890","status":"angelegt","notizen":"Musterdatensatz Test","hasPdf":1,"hasInvoice":1,"hasAbd":1,"hasAgv":1}'

echo "✅ Test abgeschlossen."