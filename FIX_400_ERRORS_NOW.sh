#!/bin/bash

echo "🔧 400 Bad Request 완전 해결 스크립트"
echo "======================================="
echo ""

# 현재 서버 중지 확인
echo "1️⃣ 서버 중지 확인..."
echo "   → Ctrl+C를 눌러 현재 서버를 중지하세요"
echo ""

# .next 폴더 삭제
echo "2️⃣ 빌드 캐시 삭제 중..."
if [ -d ".next" ]; then
  rm -rf .next
  echo "   ✅ .next 폴더 삭제 완료"
else
  echo "   ✅ .next 폴더 이미 없음"
fi
echo ""

# node_modules 캐시 삭제
echo "3️⃣ Node 모듈 캐시 삭제 중..."
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "   ✅ node_modules/.cache 삭제 완료"
else
  echo "   ✅ 캐시 폴더 이미 없음"
fi
echo ""

# 포트 정리
echo "4️⃣ 포트 3000 정리 중..."
if lsof -ti:3000 > /dev/null 2>&1; then
  kill -9 $(lsof -ti:3000) 2>/dev/null
  echo "   ✅ 포트 3000 정리 완료"
else
  echo "   ✅ 포트 3000 이미 비어있음"
fi
echo ""

# 서버 시작
echo "5️⃣ 개발 서버 시작 중..."
echo ""
echo "   🚀 서버가 시작됩니다..."
echo ""
npm run dev
