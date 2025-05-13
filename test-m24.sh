#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== API TEST: Render Backend ===${NC}"
API_RESPONSE=$(curl -s https://m24-abd-tool.onrender.com/api/vorgaenge)
if [[ $API_RESPONSE == *"["* ]]; then
    echo -e "${GREEN}✅ API OK:${NC}"
    echo "$API_RESPONSE" | jq .
else
    echo -e "${RED}❌ API Fehler${NC}"
    echo "$API_RESPONSE"
fi

echo -e "\n${GREEN}=== Frontend TEST: Startseite ===${NC}"
curl -s -o /dev/null -w "%{http_code}\n" https://m24-abd-tool.vercel.app/ | grep 200 && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ Fehler${NC}"

echo -e "\n${GREEN}=== Frontend TEST: /vorgaenge ===${NC}"
curl -s -o /dev/null -w "%{http_code}\n" https://m24-abd-tool.vercel.app/vorgaenge | grep 200 && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ Fehler${NC}"

echo -e "\n${GREEN}=== Frontend TEST: /verwaltung ===${NC}"
curl -s -o /dev/null -w "%{http_code}\n" https://m24-abd-tool.vercel.app/verwaltung | grep 200 && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ Fehler${NC}"

echo -e "${GREEN}=== Test abgeschlossen ===${NC}"