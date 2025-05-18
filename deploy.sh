#!/bin/bash
echo "📦 Baue Vite-Projekt..."
npm run build

echo "🚀 Deploy zu Vercel..."
vercel --prod --yes