# 🔴 400 Bad Request 에러 로그 분석 및 해결

## 📊 에러 로그 분석

### 1. **핵심 에러**

```
GET http://localhost:3000/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.666858de.png&w=48&q=75 
400 (Bad Request)
```

**분석:**
- ❌ 로고가 `_next/static/media/logo.666858de.png`로 처리됨
- ❌ 이는 **오래된 빌드 캐시**의 경로
- ❌ 실제로는 `public/logo.png`를 사용해야 함
- ❌ .next 폴더에 이전 빌드가 남아있음

---

### 2. **연쇄 에러**

```
GET http://localhost:3000/_next/static/css/42dcbb4eb2f613ab.css 
net::ERR_ABORTED 400 (Bad Request)

GET http://localhost:3000/_next/static/chunks/833-8694fd9be0650a4f.js 
net::ERR_ABORTED 400 (Bad Request)
```

**분석:**
- ❌ CSS와 JavaScript chunks가 모두 400 에러
- ❌ 빌드 캐시가 손상되어 정적 파일을 찾지 못함
- ❌ 브라우저가 존재하지 않는 파일을 요청

---

### 3. **ChunkLoadError**

```
ChunkLoadError: Loading chunk 833 failed.
(error: http://localhost:3000/_next/static/chunks/833-8694fd9be0650a4f.js)
```

**분석:**
- ❌ Webpack이 필요한 코드 청크를 로드하지 못함
- ❌ JavaScript 실행 중단
- ❌ React 앱이 제대로 초기화되지 못함

---

### 4. **React Hydration Error (#423)**

```
Uncaught Error: Minified React error #423
```

**분석:**
- ❌ JavaScript 로딩 실패로 인한 Hydration 불가
- ❌ 서버 렌더링된 HTML과 클라이언트 JavaScript 불일치
- ❌ 화면이 "로드 중..."에서 멈춤

---

## 🎯 근본 원인

### **오래된 빌드 캐시 (.next 폴더)**

```
문제의 흐름:
1. 이전에 src/logo.png를 import하여 빌드
   ↓
2. .next 폴더에 logo.666858de.png로 캐시됨
   ↓
3. src/logo.png 삭제 및 코드 수정
   ↓
4. 서버 재시작 (하지만 .next 폴더는 그대로)
   ↓
5. 브라우저가 오래된 빌드의 정적 파일 요청
   ↓
6. 파일이 없어서 400 Bad Request
   ↓
7. 모든 정적 파일 로딩 실패
```

---

## ✅ 해결 방법

### 방법 1: 자동 스크립트 (가장 쉬움)

```bash
./FIX_400_ERRORS_NOW.sh
```

---

### 방법 2: 수동 단계별

#### 1단계: 서버 중지
```bash
# 터미널에서 Ctrl+C
```

#### 2단계: 캐시 완전 삭제
```bash
# .next 폴더 삭제 (필수!)
rm -rf .next

# node_modules 캐시 삭제 (권장)
rm -rf node_modules/.cache
```

#### 3단계: 포트 정리
```bash
# 포트 3000 프로세스 종료
kill -9 $(lsof -ti:3000) 2>/dev/null
```

#### 4단계: 서버 재시작
```bash
npm run dev
```

---

### 방법 3: 원라이너

```bash
pkill -9 node && rm -rf .next node_modules/.cache && npm run dev
```

---

## 🌐 브라우저 캐시도 삭제하세요!

### Chrome/Edge

```
1. F12 (개발자 도구)
2. Application 탭
3. Clear storage
4. Clear site data 클릭
```

또는

```
Cmd+Shift+Delete (Mac)
Ctrl+Shift+Delete (Windows)
```

---

## 📋 에러별 상세 분석

### 1. 로고 이미지 400 에러

**에러:**
```
GET http://localhost:3000/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.666858de.png
```

**원인:**
- Webpack이 `src/logo.png`를 `_next/static/media/`로 처리
- 파일 해시 추가 (666858de)
- .next 폴더에 캐시됨

**현재 상태:**
```
✅ src/logo.png 삭제됨
✅ public/logo.png 존재 (21KB)
✅ header.tsx에서 "/logo.png" 사용
❌ .next 폴더에 오래된 빌드 캐시
```

**해결:**
```bash
rm -rf .next
npm run dev
```

---

### 2. CSS 파일 400 에러

**에러:**
```
GET http://localhost:3000/_next/static/css/42dcbb4eb2f613ab.css
net::ERR_ABORTED 400
```

**원인:**
- 빌드 캐시에 있는 CSS 파일 해시
- 실제 파일은 다른 해시로 재생성되었거나 없음

**해결:**
```bash
rm -rf .next
npm run dev
```

---

### 3. JavaScript Chunks 400 에러

**에러:**
```
GET http://localhost:3000/_next/static/chunks/833-8694fd9be0650a4f.js
net::ERR_ABORTED 400
```

**원인:**
- Webpack이 생성한 코드 청크 파일
- 빌드 캐시와 실제 파일 불일치

**해결:**
```bash
rm -rf .next
npm run dev
```

---

### 4. ChunkLoadError

**에러:**
```
ChunkLoadError: Loading chunk 833 failed.
```

**원인:**
- JavaScript 청크 로딩 실패
- 필요한 코드를 실행할 수 없음

**영향:**
- React 컴포넌트 로딩 실패
- 페이지 인터랙션 불가
- 화면 멈춤

**해결:**
```bash
rm -rf .next
npm run dev
```

---

### 5. React Error #423 (Hydration)

**에러:**
```
Minified React error #423
```

**의미:**
- Hydration 실패
- 서버 렌더링 HTML ≠ 클라이언트 JavaScript

**원인:**
- JavaScript 로딩 실패로 Hydration 불가
- 또는 서버/클라이언트 렌더링 불일치

**해결:**
1. 빌드 캐시 삭제
```bash
rm -rf .next
```

2. suppressHydrationWarning 확인 (이미 적용됨)
```typescript
// layout.tsx
<html lang="ja" suppressHydrationWarning>
  <body suppressHydrationWarning>
```

---

## 🔍 파일 경로 검증

### 현재 상태 (정상)

```
✅ 코드:
src/components/ui/header.tsx:
  <Image src="/logo.png" ... />

✅ 파일:
public/logo.png (21KB)

✅ Import:
No import statements for logo

❌ 문제:
.next 폴더에 오래된 빌드 캐시
```

### 빌드 후 예상 경로

**올바른 경로:**
```
GET http://localhost:3000/logo.png → 200 OK
GET http://localhost:3000/_next/static/css/[hash].css → 200 OK
GET http://localhost:3000/_next/static/chunks/[hash].js → 200 OK
```

**잘못된 경로 (현재):**
```
GET http://localhost:3000/_next/static/media/logo.[hash].png → 400
GET http://localhost:3000/_next/static/css/42dcbb4eb2f613ab.css → 400
GET http://localhost:3000/_next/static/chunks/833-[hash].js → 400
```

---

## 🎯 해결 체크리스트

### 필수 단계

```
□ 1. 서버 중지 (Ctrl+C)
□ 2. rm -rf .next
□ 3. rm -rf node_modules/.cache
□ 4. kill -9 $(lsof -ti:3000)
□ 5. npm run dev
□ 6. 브라우저 캐시 삭제 (Cmd+Shift+R)
```

### 확인 사항

```
□ 서버가 포트 3000에서 시작됨
□ "Ready in XXXms" 메시지
□ http://localhost:3000 접속
□ F12 → Console: 에러 없음
□ F12 → Network: 모든 파일 200 OK
```

---

## 📊 성공 기준

### 터미널 출력

```
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000  ✅
  
 ✓ Ready in 700ms
```

### 브라우저 Console

```
✅ No errors
⚠️ Supabase warning (정상 - placeholder 설정)
```

### 브라우저 Network

```
Status  Method  File
200     GET     /logo.png               ✅
200     GET     /_next/static/css/      ✅
200     GET     /_next/static/chunks/   ✅

❌ 400 Bad Request 없음!
❌ ChunkLoadError 없음!
❌ React Error #423 없음!
```

---

## 💡 왜 이런 일이 발생했나?

### 빌드 캐시 메커니즘

```
Next.js 빌드 프로세스:

1. 소스 파일 분석
   ↓
2. Webpack으로 번들링
   ↓
3. 정적 파일 생성 (해시 추가)
   ↓
4. .next 폴더에 저장
   ↓
5. 서버가 .next에서 파일 제공
```

### 문제 발생 시나리오

```
1. src/logo.png 사용 → 빌드
   → .next/static/media/logo.666858de.png 생성

2. src/logo.png 삭제 + 코드 수정

3. 서버 재시작 (하지만 .next는 그대로)

4. HTML은 새로운 경로 사용 (/logo.png)
   하지만 .next에는 오래된 파일 정보

5. 브라우저가 오래된 경로 요청
   → 파일 없음 → 400 에러
```

---

## 🛡️ 예방 방법

### 큰 변경 시 항상 실행

```bash
# 파일 경로 변경, import 방식 변경 등
rm -rf .next && npm run dev
```

### Git에서 .next 무시

```.gitignore
.next/
node_modules/
.cache/
```

### 캐시 문제 발생 시

```bash
# 완전 초기화
rm -rf .next node_modules/.cache
npm run dev
```

---

## 🎉 해결 완료 확인

### 1. 터미널 확인

```
✅ 서버가 포트 3000에서 시작
✅ 에러 메시지 없음
✅ "Ready" 메시지
```

### 2. 브라우저 확인

```
✅ 페이지 정상 렌더링
✅ 로고 표시
✅ 스타일 적용
✅ JavaScript 작동
```

### 3. F12 → Console

```
✅ 에러 없음
⚠️ Supabase 경고만 (정상)
```

### 4. F12 → Network

```
✅ 모든 파일 200 OK
✅ 400 에러 없음
```

---

## 🚨 지금 바로 실행하세요!

```bash
# 방법 1: 자동 스크립트
./FIX_400_ERRORS_NOW.sh

# 방법 2: 원라이너
pkill -9 node && rm -rf .next node_modules/.cache && npm run dev

# 방법 3: 단계별
# 1. Ctrl+C
# 2. rm -rf .next
# 3. npm run dev
```

**모든 400 에러가 즉시 해결될 것입니다!** 🎊
