#!/bin/sh

echo "========================================"
echo "🔍 Smart Home App - Environment Check"
echo "========================================"
echo ""
echo "Checking environment variables..."
echo ""

# Проверяем переменные
if [ -n "$MONGODB_URI" ]; then
    echo "✅ MONGODB_URI is set"
    # Маскируем URI для безопасности
    MASKED_URI=$(echo "$MONGODB_URI" | sed 's/\/\/[^:]*:[^@]*@/\/\/***:***@/')
    echo "   Value: $MASKED_URI"
else
    echo "❌ MONGODB_URI is NOT set"
    echo "   Hint: Check HF Spaces Settings → Variables and secrets"
fi
echo ""

if [ -n "$JWT_SECRET" ]; then
    echo "✅ JWT_SECRET is set"
else
    echo "❌ JWT_SECRET is NOT set"
fi
echo ""

if [ -n "$BACKEND_URL" ]; then
    echo "✅ BACKEND_URL is set: $BACKEND_URL"
else
    echo "❌ BACKEND_URL is NOT set"
fi
echo ""

if [ -n "$FRONTEND_URL" ]; then
    echo "✅ FRONTEND_URL is set: $FRONTEND_URL"
else
    echo "❌ FRONTEND_URL is NOT set"
fi
echo ""

if [ -n "$OPENWEATHER_API_KEY" ]; then
    echo "✅ OPENWEATHER_API_KEY is set"
else
    echo "❌ OPENWEATHER_API_KEY is NOT set"
fi
echo ""

echo "========================================"
echo "Starting server..."
echo "========================================"

# Запускаем сервер
exec node server/index.js
