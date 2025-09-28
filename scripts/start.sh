#!/usr/bin/env bash
set -euo pipefail

# DB用の環境変数を組み立ててエクスポート
ENC_USER=$(node -e "console.log(encodeURIComponent(process.env.DB_USER||''))")
ENC_PASS=$(node -e "console.log(encodeURIComponent(process.env.DB_PASS||''))")

export DATABASE_URL="postgresql://${ENC_USER}:${ENC_PASS}@${DB_HOST}:${DB_PORT:-5432}/${DB_NAME}?schema=public&sslmode=require"

# 必要なら Prisma の migrate を実行
# npx prisma migrate deploy

# Nest アプリを起動
node dist/main.js