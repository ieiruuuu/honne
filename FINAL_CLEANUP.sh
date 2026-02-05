#!/bin/bash

echo "🔧 완전 초기화 시작..."
echo ""

# Step 1: 실행 중인 서버 종료
echo "1️⃣ 서버 종료 중..."
kill -9 $(lsof -ti:3000) 2>/dev/null || true
sleep 1

# Step 2: 빌드 캐시 삭제
echo "2️⃣ 빌드 캐시 삭제 중..."
rm -rf .next
rm -rf node_modules/.cache
echo "   ✅ .next 삭제 완료"
echo "   ✅ node_modules/.cache 삭제 완료"
sleep 1

# Step 3: 서버 재시작
echo ""
echo "3️⃣ 서버 시작 중..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev
