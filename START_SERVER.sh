#!/bin/bash

echo "🔧 400 Bad Request 해결 스크립트"
echo "================================"
echo ""

# 1. 포트 3000 정리
echo "1️⃣ 포트 3000 정리 중..."
if lsof -ti:3000 > /dev/null 2>&1; then
  kill -9 $(lsof -ti:3000) 2>/dev/null
  echo "   ✅ 포트 3000 정리 완료"
else
  echo "   ✅ 포트 3000 이미 비어있음"
fi

echo ""

# 2. .next 폴더 삭제 (선택사항 - 주석 해제하려면 # 제거)
# echo "2️⃣ 빌드 캐시 삭제 중..."
# rm -rf .next
# echo "   ✅ .next 폴더 삭제 완료"
# echo ""

# 3. 개발 서버 시작
echo "2️⃣ 개발 서버 시작 중..."
echo ""
npm run dev
