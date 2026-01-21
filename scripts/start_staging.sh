#!/bin/bash
# scripts/start_staging.sh
# 
# Inicia servidor en modo staging con Redis inválido para validar fail-closed

export NODE_ENV=staging
export REDIS_URL=redis://invalid-redis-host:6379

echo "🚀 Starting server in STAGING mode"
echo "📍 NODE_ENV=$NODE_ENV"
echo "🔴 REDIS_URL=$REDIS_URL (invalid, for fail-closed testing)"
echo ""

cd /home/ubuntu/aresk-obs
pnpm exec tsx server/_core/index.ts
