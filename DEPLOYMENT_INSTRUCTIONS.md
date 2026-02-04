# 🚀 Vercel 배포 가이드 (단계별 실행)

## ✅ 현재 상태

```
브랜치: main
대기 중인 커밋: 3개
- d954f0b: 파비콘 적용
- 276b6cb: 좋아요, 카테고리, 로고 기능
- 9d52117: 배포 가이드 추가

상태: 로컬 커밋 완료 ✅
다음 단계: GitHub 푸시 필요 ⏳
```

---

## 📦 배포될 모든 기능

### 🎯 이번 업데이트 내용

✅ **좋아요 시스템** (`useLike.ts`)
- 빨간 하트 UI (fill-red-500)
- 실시간 토글 기능
- Optimistic Update
- 로그인 필수 정책
- Supabase `post_likes` 연동

✅ **카테고리 네비게이션**
- `/categories` 독립 페이지
- 2열 그리드 레이아웃
- 10개 일본어 카테고리
- `/category/[slug]` 동적 필터링
- 카테고리별 아이콘 & 색상

✅ **로고 & 브랜딩**
- 헤더 로고 (35x35px)
- 브라우저 파비콘 (icon.png)
- Apple Touch Icon
- 브랜드 일관성

✅ **로그인 필수 정책**
- 댓글 작성 제한
- 게시물 작성 제한
- 좋아요 제한
- 일본어 안내 메시지

---

## 🔧 1단계: GitHub 푸시

### 터미널에서 실행

```bash
# 프로젝트 디렉토리로 이동
cd /Users/yalekim/Desktop/honne

# 현재 상태 확인 (선택사항)
git status

# GitHub에 푸시
git push origin main
```

### 🔐 인증 방법

#### 방법 A: Personal Access Token (PAT) 사용 (권장)

```
Username: [GitHub 사용자명]
Password: [Personal Access Token]
```

**PAT가 없다면?**

1. **https://github.com/settings/tokens** 접속
2. **"Generate new token"** → **"Tokens (classic)"** 선택
3. **Note**: "Honne Deployment" 입력
4. **Expiration**: 90 days (또는 원하는 기간)
5. **Select scopes**: ✅ **repo** (전체 선택)
6. **"Generate token"** 클릭
7. **토큰 복사** (다시 볼 수 없으니 안전한 곳에 저장!)

#### 방법 B: GitHub CLI 사용

```bash
# GitHub CLI 로그인 (처음 한 번만)
gh auth login

# 푸시 실행
git push origin main
```

#### 방법 C: SSH 키 사용

```bash
# 원격 저장소 URL을 HTTPS에서 SSH로 변경
git remote set-url origin git@github.com:[사용자명]/honne.git

# SSH 푸시
git push origin main
```

#### 방법 D: GitHub Desktop 앱

```
1. GitHub Desktop 열기
2. "honne" 저장소 선택
3. 상단의 "Push origin" 버튼 클릭 (3 commits)
4. 필요시 GitHub 로그인
```

#### 방법 E: VS Code 통합

```
1. VS Code에서 Source Control 패널 열기 (Cmd+Shift+G)
2. 상단 "..." 메뉴 클릭
3. "Push" 선택
4. GitHub 인증 팝업 → 승인
```

---

## 🌐 2단계: Vercel 자동 배포 확인

### Vercel 배포 프로세스

```
GitHub Push 완료
    ↓
Vercel이 자동으로 감지 (약 5초)
    ↓
빌드 시작 (Building...)
    ↓
- Installing dependencies
- Running next build
- Optimizing images
- Generating static pages
    ↓
빌드 완료 (2-3분 소요)
    ↓
배포 완료! 🚀
    ↓
Production URL 자동 업데이트
```

### 배포 상태 확인 방법

#### 방법 1: Vercel Dashboard

```
1. https://vercel.com/dashboard 접속
2. "honne" 프로젝트 클릭
3. "Deployments" 탭 선택
4. 최상단에 새 배포 표시

배포 상태:
🔵 Building - 빌드 진행 중
✅ Ready - 배포 완료
❌ Error - 오류 발생
⏸️ Canceled - 취소됨
```

#### 방법 2: 실시간 로그 확인

```
Vercel Dashboard → 최신 Deployment 클릭
    ↓
"View Function Logs" 또는 "Building" 클릭
    ↓
실시간 빌드 로그 확인
```

#### 방법 3: Vercel CLI (선택사항)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포 상태 확인
vercel ls
```

---

## ⚙️ 3단계: 환경 변수 확인 (필수!)

### ⚠️ 중요: 환경 변수 미설정 시 문제

```
환경 변수가 없으면:
❌ 로그인 불가
❌ LINE 로그인 실패
❌ 데이터베이스 연결 실패
❌ 모든 API 호출 실패

→ 배포된 사이트가 작동하지 않습니다!
```

### 환경 변수 설정 방법

#### 1. Vercel Dashboard 접속

```
https://vercel.com/dashboard
→ "honne" 프로젝트 클릭
→ "Settings" 탭
→ "Environment Variables" 메뉴
```

#### 2. 필수 환경 변수 입력

로컬의 `.env.local` 파일 내용을 그대로 복사해서 입력:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LINE Login (Client)
NEXT_PUBLIC_LINE_CLIENT_ID=1234567890
NEXT_PUBLIC_LINE_REDIRECT_URI=https://your-app.vercel.app/auth/callback

# LINE Login (Server)
LINE_CLIENT_ID=1234567890
LINE_CLIENT_SECRET=abcdef1234567890abcdef1234567890
```

#### 3. 환경별 설정

각 변수마다 체크박스 선택:
- ✅ **Production** (필수)
- ✅ **Preview** (권장)
- ✅ **Development** (선택)

#### 4. 저장 및 재배포

```
1. "Save" 버튼 클릭
2. Vercel Dashboard → Deployments
3. 최신 배포 클릭
4. "..." 메뉴 → "Redeploy"
5. "Redeploy" 버튼 클릭
```

### 환경 변수 확인 체크리스트

```
□ NEXT_PUBLIC_SUPABASE_URL 입력
□ NEXT_PUBLIC_SUPABASE_ANON_KEY 입력
□ NEXT_PUBLIC_LINE_CLIENT_ID 입력
□ NEXT_PUBLIC_LINE_REDIRECT_URI 입력 (Production URL로!)
□ LINE_CLIENT_ID 입력
□ LINE_CLIENT_SECRET 입력
□ Production 체크박스 선택
□ Save 버튼 클릭
□ 재배포 실행
```

---

## 🧪 4단계: 배포 후 테스트

### 프로덕션 URL 확인

```
Vercel Dashboard → honne 프로젝트
→ 최상단에 Production URL 표시

예시: https://honne-abc123.vercel.app
```

### 전체 기능 테스트 체크리스트

#### 🎨 로고 & 파비콘
```
□ 헤더 왼쪽 상단에 로고 표시
□ 로고 클릭 시 홈으로 이동
□ 브라우저 탭에 파비콘 표시
□ 모바일에서 로고 크기 적절
```

#### ❤️ 좋아요 시스템
```
□ 비로그인: 클릭 시 로그인 모달 표시
□ 로그인: 하트 빨간색으로 변경 (fill-red-500)
□ 좋아요 숫자 실시간 업데이트
□ 메인 피드에서 작동
□ 게시물 상세 페이지에서 작동
□ 좋아요 취소 가능
```

#### 📂 카테고리 네비게이션
```
□ 하단 네비 "カテゴリー" 버튼 표시
□ 클릭 시 /categories 페이지 이동
□ 10개 카테고리 2열 그리드 표시
□ 각 카테고리 아이콘 & 색상 정확
□ 카테고리 선택 시 필터링 작동
□ URL이 /category/[카테고리명]으로 변경
□ 필터링된 게시물만 표시
□ 뒤로가기 버튼 작동
□ 하단 네비 활성 상태 표시
```

#### 🔐 로그인 필수 정책
```
□ 댓글 입력란: 비로그인 시 비활성화
□ 댓글 클릭 시 로그인 모달
□ 글쓰기 버튼: 비로그인 시 로그인 페이지
□ 좋아요: 비로그인 시 로그인 모달
□ 모든 안내 메시지 일본어로 표시
```

#### 🔑 로그인 시스템
```
□ LINE 로그인 버튼 작동
□ Email/Password 로그인 작동
□ 로그인 후 닉네임 생성
□ 마이페이지 정보 표시
□ 로그아웃 작동
```

#### 📱 전체 기능
```
□ 메인 피드 게시물 표시
□ 게시물 클릭 시 상세 페이지
□ 댓글 작성 및 표시
□ 알림 기능
□ 검색 기능
□ 내 게시물 필터링
□ 닉네임 재생성
□ 모바일 반응형 레이아웃
□ 다크모드 지원 (있다면)
```

---

## 🐛 문제 해결

### 문제 1: 빌드 실패

**증상:**
```
❌ Build Error
Error: Module not found
```

**해결:**

```bash
# 로컬에서 빌드 테스트
cd /Users/yalekim/Desktop/honne
npm run build

# 오류 확인 및 수정
# 수정 후 커밋
git add .
git commit -m "fix: Fix build error"
git push origin main
```

### 문제 2: 환경 변수 오류

**증상:**
```
로그인 실패
데이터 로드 안됨
API 오류
```

**해결:**

```
1. Vercel Dashboard → Settings → Environment Variables
2. 모든 변수 다시 확인
3. NEXT_PUBLIC_LINE_REDIRECT_URI를 Production URL로 변경
   예: https://honne-abc123.vercel.app/auth/callback
4. Deployments → Redeploy
```

### 문제 3: 이미지 최적화 경고

**증상:**
```
⚠️ Warning: Using `next/image` without sharp
```

**해결:**

```bash
# Sharp 설치
npm install sharp

# 커밋 및 푸시
git add package.json package-lock.json
git commit -m "chore: Add sharp for image optimization"
git push origin main
```

### 문제 4: 404 오류

**증상:**
```
특정 페이지에서 404 Not Found
```

**해결:**

```
1. 파일 경로 확인: app/[route]/page.tsx 존재 확인
2. 동적 라우트 확인: [id], [slug] 등
3. 로컬에서 테스트: npm run dev
4. 빌드 테스트: npm run build && npm start
```

### 문제 5: CSS가 적용되지 않음

**증상:**
```
스타일이 깨짐
Tailwind CSS 클래스 미작동
```

**해결:**

```
1. tailwind.config.js의 content 경로 확인
2. globals.css에 Tailwind directives 확인:
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
3. 캐시 삭제 후 재빌드
```

### 문제 6: Supabase 연결 실패

**증상:**
```
데이터 로드 안됨
Authentication failed
```

**해결:**

```
1. Supabase Dashboard 접속
2. Project Settings → API
3. URL과 anon key 다시 복사
4. Vercel 환경 변수 업데이트
5. Row Level Security (RLS) 정책 확인
```

---

## 📊 배포 통계

### 이번 배포 내용

```
총 커밋: 3개
변경된 파일: 25개
추가된 코드: 5,178줄
삭제된 코드: 47줄

주요 추가 기능:
✨ useLike.ts - 좋아요 시스템
✨ categories/page.tsx - 카테고리 목록
✨ category/[category]/page.tsx - 카테고리 필터링
✨ icon.png - 파비콘
✨ Header 업데이트 - 로고 전용
✨ BottomNav 업데이트 - 카테고리 버튼
✨ PostCard 업데이트 - 좋아요 UI
✨ 11개 문서 파일
```

---

## 🎯 배포 완료 후

### 1. 성능 모니터링

```
Vercel Dashboard → Analytics
- 페이지 뷰
- 사용자 수
- 로딩 속도
- Core Web Vitals
```

### 2. 에러 로그 확인

```
Vercel Dashboard → Logs
- Runtime Logs
- Function Logs
- Build Logs
```

### 3. 사용자 피드백

```
□ 베타 테스터 초대
□ 피드백 수집
□ 버그 리포트 확인
□ 개선 사항 정리
```

---

## 🚀 빠른 배포 명령어 (다음번부터)

```bash
# 1. 변경사항 확인
git status

# 2. 스테이징
git add .

# 3. 커밋
git commit -m "feat: 새로운 기능 추가"

# 4. 푸시 (Vercel이 자동 배포)
git push origin main
```

---

## ✅ 최종 체크리스트

### 배포 전
```
✅ 로컬 빌드 성공 (npm run build)
✅ 로컬 테스트 완료 (npm run dev)
✅ Git 커밋 완료 (3 commits)
⏳ GitHub 푸시 필요
```

### 배포 중
```
⏳ git push origin main 실행
⏳ Vercel 자동 빌드 대기
⏳ 환경 변수 확인
```

### 배포 후
```
⏳ Production URL 테스트
⏳ 모든 기능 확인
⏳ 모바일 테스트
⏳ 에러 로그 확인
```

---

## 📞 도움이 필요하면?

### Vercel 문서
- https://vercel.com/docs
- https://vercel.com/docs/deployments/overview

### Next.js 문서
- https://nextjs.org/docs/deployment

### Supabase 문서
- https://supabase.com/docs/guides/auth

---

## 🎉 배포 준비 완료!

**현재 상태: 로컬 커밋 완료 ✅**

**다음 단계:**

```bash
cd /Users/yalekim/Desktop/honne
git push origin main
```

**그 다음:**
1. Vercel Dashboard에서 빌드 확인
2. 환경 변수 설정 확인
3. Production URL에서 테스트

**푸시 후 Vercel이 자동으로 배포를 시작합니다!** 🚀
