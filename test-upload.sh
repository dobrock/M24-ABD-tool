#!/bin/bash

# Setze deine Test-ID
ID="ecaccbc7-e0d6-45ca-9e24-c5db2ee27ff4"

echo "➡️  Test: PDF hochladen"
curl -X POST https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/upload/pdf \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-files/test-pdf.pdf"
echo

echo "➡️  Test: Rechnung hochladen"
curl -X POST https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/upload/rechnung \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-files/test-rechnung.pdf"
echo

echo "➡️  Test: ABD hochladen"
curl -X POST https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/upload/abd \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-files/test-abd.pdf"
echo

echo "➡️  Test: AGV hochladen"
curl -X POST https://m24-abd-tool.onrender.com/api/vorgaenge/$ID/upload/agv \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-files/test-agv.pdf"
echo

echo "✅ Test abgeschlossen."