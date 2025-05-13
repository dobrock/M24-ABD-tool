#!/bin/bash

ID="abd3e6a0-7075-405f-a619-dd3e2951cac4"  # Bitte die echte Vorgangs-ID einsetzen (z.B. ecaccbc7-e0d6-45ca-9e24-c5db2ee27ff4)

echo "➡️  Test: PDF hochladen"
curl -s -X POST https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/upload/pdf \
  -F "file=@test-files/test-pdf.pdf" | jq

echo "➡️  Test: Rechnung hochladen"
curl -s -X POST https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/upload/rechnung \
  -F "file=@test-files/test-pdf.pdf" | jq

echo "➡️  Test: ABD hochladen"
curl -s -X POST https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/upload/abd \
  -F "file=@test-files/test-pdf.pdf" | jq

echo "➡️  Test: AGV hochladen"
curl -s -X POST https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/upload/agv \
  -F "file=@test-files/test-pdf.pdf" | jq

echo "➡️  Prüfung: Vorgang abrufen"
curl -s https://m24-abd-tool.onrender.com/api/vorgang/$ID | jq

echo "➡️  Test: Downloads prüfen"
echo "PDF:"
curl -s -I https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/files/pdf.pdf
echo "Rechnung:"
curl -s -I https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/files/rechnung.pdf
echo "ABD:"
curl -s -I https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/files/abd.pdf
echo "AGV:"
curl -s -I https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/files/agv.pdf

echo "✅ Upload- & Download-Test abgeschlossen."