# 🚨 긴급: 개발 서버 재시작 가이드

## ⚠️ 현재 상황

```
❌ 포트 3000이 다른 프로세스에 점유됨
❌ 개발 서버가 포트 3001에서 실행 중
❌ 오래된 빌드 캐시 사용 중
✅ 코드 수정 완료 (header.tsx, public/logo.png)
✅ .next 폴더 재빌드 완료
```

**문제:**
- 수정된 코드가 적용되지 않은 오래된 서버가 실행 중입니다
- 포트 충돌로 인해 3001 포트에서 실행되고 있습니다

---

## 🎯 즉시 실행할 명령어 (순서대로)

### 1️⃣ 현재 개발 서버 중지

터미널에서 `Ctrl+C`를 눌러 현재 실행 중인 서버를 중지하세요.

```bash
# 터미널에서 Ctrl+C 누르기
^C
```

---

### 2️⃣ 포트 3000 프로세스 강제 종료

```bash
# 포트 3000을 사용하는 프로세스 찾기
lsof -ti:3000

# 출력된 PID를 사용해서 강제 종료
kill -9 $(lsof -ti:3000)
```

**또는 한 번에:**
```bash
kill -9 $(lsof -ti:3000) 2>/dev/null || echo "포트 3000은 이미 비어있습니다"
```

---

### 3️⃣ .next 폴더 확인 (선택사항)

이미 재빌드되었지만, 확실하게 하려면:

```bash
# .next 폴더 삭제 (선택사항)
rm -rf .next

# 또는 빌드만 다시 실행
npm run build
```

⚠️ **참고:** 이미 최신 빌드가 완료되었으므로 이 단계는 선택사항입니다.

---

### 4️⃣ 개발 서버 재시작 (필수!)

```bash
npm run dev
```

**기대 출력:**
```
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000  ✅ (3001이 아님!)
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 700ms
```

---

### 5️⃣ 브라우저 새로고침 (필수!)

```
1. http://localhost:3000 접속
   (3001이 아닌 3000!)

2. 브라우저 완전 새로고침
   Cmd+Shift+R (Mac)
   Ctrl+Shift+R (Windows)
```

---

## 🚀 빠른 원라이너 (모든 작업 한 번에)

터미널에 다음 명령어를 **복사-붙여넣기** 하세요:

```bash
# 1. 포트 3000 정리
kill -9 $(lsof -ti:3000) 2>/dev/null

# 2. .next 폴더 삭제 (선택사항)
# rm -rf .next

# 3. 개발 서버 시작
npm run dev
```

---

## 📋 체크리스트

### 서버 시작 전 ✅
```
✅ Ctrl+C로 현재 서버 중지
✅ 포트 3000 프로세스 종료
✅ (선택) .next 폴더 삭제
```

### 서버 시작 후 ✅
```
✅ localhost:3000에서 실행 중 (3001 아님!)
✅ "Ready in XXXms" 메시지 확인
✅ 브라우저에서 Cmd+Shift+R
✅ F12 → Console에서 400 에러 없음
✅ 로고 정상 표시
```

---

## 🔍 문제 해결

### 문제 1: 여전히 포트 3000이 사용 중

```bash
# 모든 Node 프로세스 확인
ps aux | grep node

# 특정 프로세스 강제 종료
kill -9 <PID>

# 또는 모든 Node 프로세스 종료 (주의!)
pkill -9 node
```

### 문제 2: 여전히 400 에러 발생

```bash
# 완전한 초기화
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### 문제 3: "로드 중..." 화면에서 멈춤

**원인:** JavaScript 청크를 로드하지 못해 하이드레이션 실패

**해결:**
1. F12 → Network 탭 확인
2. 실패한 리소스 확인
3. 브라우저 캐시 완전 삭제
   - F12 → Application → Clear storage → Clear site data

---

## ✅ 수정 완료된 항목

### 1. Logo Path ✅
```typescript
// Before (문제)
import LogoImage from "@/logo.png";
<Image src={LogoImage} ... />

// After (해결)
<Image src="/logo.png" ... />
```

### 2. Config Asset Prefix ✅
```javascript
// next.config.mjs
const nextConfig = {};  // ✅ 깨끗함, assetPrefix/basePath 없음
```

### 3. Public Folder ✅
```
public/
  └── logo.png  ✅ 존재함 (21KB)
```

### 4. Build ✅
```
✅ .next 폴더 재빌드 완료 (11:13)
✅ 15개 페이지 모두 성공
✅ No build errors
```

---

## 🎯 핵심 요약

### 문제
```
❌ 포트 3000 충돌
❌ 오래된 서버 (포트 3001)
❌ 수정사항 미반영
```

### 해결
```
1️⃣ Ctrl+C로 서버 중지
2️⃣ kill -9 $(lsof -ti:3000)
3️⃣ npm run dev
4️⃣ Cmd+Shift+R (브라우저 새로고침)
```

### 결과
```
✅ localhost:3000에서 실행
✅ 최신 빌드 적용
✅ 로고 정상 표시
✅ 400 에러 없음
✅ 정적 파일 정상 로드
```

---

## 🚨 지금 바로 실행하세요!

**터미널에서:**
```bash
# 1. 현재 서버 중지 (Ctrl+C)

# 2. 포트 정리 및 재시작
kill -9 $(lsof -ti:3000) 2>/dev/null && npm run dev
```

**브라우저에서:**
```
1. http://localhost:3000 접속
2. Cmd+Shift+R (완전 새로고침)
```

---

## 📊 기대 결과

### F12 → Console
```
✅ No 400 errors
✅ No ChunkLoadError
✅ All resources loaded
```

### F12 → Network
```
GET /logo.png               200 OK  ✅
GET /_next/static/chunks/   200 OK  ✅
GET /_next/static/...       200 OK  ✅
```

### 화면
```
✅ 로고 정상 표시 (좌측 상단)
✅ 페이지 로딩 완료
✅ "로드 중..." 화면 사라짐
✅ 모든 스타일 적용됨
```

---

## 💡 왜 이런 일이?

1. **포트 충돌**
   - 이전에 종료되지 않은 서버가 포트 3000 점유
   - 새 서버가 3001로 실행됨

2. **오래된 빌드 캐시**
   - 포트 3001의 서버가 수정 전 .next 캐시 사용
   - 로고 import 오류가 있는 버전 실행 중

3. **정적 파일 경로 깨짐**
   - 잘못된 로고 import로 인해 빌드 손상
   - 모든 /_next/static 경로에 400 에러 발생

---

**지금 바로 터미널에서 명령어를 실행하세요!** 🚀

모든 문제가 즉시 해결될 것입니다! 😊
