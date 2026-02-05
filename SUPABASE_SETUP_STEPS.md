# 🚀 Supabase 설정 - 단계별 가이드

## ⏱️ 소요 시간: 5-10분

---

## 📋 1단계: Supabase 계정 생성 및 프로젝트 만들기

### 1-1. Supabase 웹사이트 접속

```
🌐 https://supabase.com
```

브라우저에서 위 주소로 이동하세요.

### 1-2. 회원가입

```
1. "Start your project" 버튼 클릭
2. 다음 중 하나 선택:
   - GitHub 계정으로 로그인
   - 이메일로 가입
```

### 1-3. 새 프로젝트 생성

```
1. Dashboard에서 "New Project" 클릭
2. 다음 정보 입력:
   
   Organization: (자동 생성됨 또는 선택)
   
   Name: honne
   (또는 원하는 프로젝트 이름)
   
   Database Password: ████████████
   (안전한 비밀번호 입력 - 복사해서 메모장에 저장!)
   
   Region: Northeast Asia (Seoul)
   (한국 서버 선택 - 가장 빠름)
   
   Pricing Plan: Free (무료)

3. "Create new project" 버튼 클릭

4. 프로젝트 생성 대기 (약 2분)
   ⏳ 커피 한 모금 마시세요!
```

---

## 📋 2단계: API 키 가져오기

### 2-1. Settings 메뉴로 이동

```
1. 왼쪽 사이드바에서 ⚙️ Settings 클릭
2. "API" 메뉴 클릭
```

### 2-2. 필요한 정보 복사

화면에서 다음 2개를 찾아서 **복사**하세요:

#### ① Project URL

```
https://xxxxxxxxxxxxx.supabase.co
```

**복사 방법:**
- "Project URL" 섹션에서 복사 버튼 클릭
- 메모장에 붙여넣기

#### ② anon public key

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
(매우 긴 문자열)
```

**복사 방법:**
- "Project API keys" 섹션
- "anon public" 키 찾기
- 복사 버튼 클릭
- 메모장에 붙여넣기

**⚠️ 중요:**
- 이 2개의 값을 메모장에 저장하세요!
- 다음 단계에서 사용합니다.

---

## 📋 3단계: 데이터베이스 테이블 생성

### 3-1. SQL Editor 열기

```
1. 왼쪽 사이드바에서 🔨 SQL Editor 클릭
2. "+ New query" 버튼 클릭
```

### 3-2. SQL 실행

```
1. 프로젝트 루트에 있는 파일 열기:
   📄 supabase_schema.sql

2. 파일 내용 전체 복사 (Cmd+A, Cmd+C)

3. Supabase SQL Editor에 붙여넣기 (Cmd+V)

4. ▶️ "Run" 버튼 클릭 (또는 Cmd+Enter)

5. 성공 메시지 확인:
   ✅ Success. No rows returned
```

**실행 내용:**
- ✅ Posts 테이블 생성 (게시글)
- ✅ Post Likes 테이블 생성 (좋아요)
- ✅ Comments 테이블 생성 (댓글)
- ✅ Notifications 테이블 생성 (알림)
- ✅ 인덱스 생성 (성능 최적화)
- ✅ RLS 정책 설정 (보안)
- ✅ Realtime 활성화

---

## 📋 4단계: .env.local 파일 업데이트

### 4-1. .env.local 파일 열기

```
📍 위치: /Users/yalekim/Desktop/honne/.env.local

VS Code 또는 텍스트 에디터로 열기
```

### 4-2. Supabase 설정 업데이트

**현재 (Before):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**수정 (After):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ 중요:**
- `https://xxxxxxxxxxxxx.supabase.co` → 2단계에서 복사한 **실제 Project URL**로 교체
- `eyJhbGciOi...` → 2단계에서 복사한 **실제 anon public key**로 교체
- LINE Login 설정은 **그대로 유지**

### 4-3. 파일 저장

```
Cmd+S (Mac) 또는 Ctrl+S (Windows)
```

---

## 📋 5단계: 서버 재시작

### 5-1. 터미널 열기

```
VS Code에서:
- 메뉴 → Terminal → New Terminal
- 또는 Ctrl+` (백틱)
```

### 5-2. 빌드 캐시 삭제 및 서버 시작

터미널에서 **정확히 이 명령어** 실행:

```bash
rm -rf .next && npm run dev
```

**실행 내용:**
1. `.next` 폴더 삭제 (빌드 캐시)
2. 개발 서버 시작

### 5-3. 서버 시작 확인

터미널에 다음과 같이 표시되면 성공:

```
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000
  
 ✓ Ready in 2000ms
```

---

## 📋 6단계: 브라우저 새로고침

### 6-1. 완전 새로고침

```
브라우저에서:
- Mac: Cmd+Shift+R
- Windows: Ctrl+Shift+R
```

### 6-2. Console 확인 (F12)

**Before (설정 전):**
```
⚠️ Supabase configuration not properly set.
URL: https://placeholder.supabase.co
```

**After (설정 후):**
```
✅ Fetched 0 posts from Supabase
📊 Posts data: []
```

**⚠️ 경고가 사라졌나요?**
- ✅ 예 → 성공! 다음 단계로
- ❌ 아니오 → .env.local 파일 다시 확인

---

## 📋 7단계: 기능 테스트

### 7-1. 회원가입

```
1. 우측 상단 "ログイン" 버튼 클릭
2. "メールアドレスで続ける" 클릭
3. 이메일 & 비밀번호 입력
4. "登録" 버튼 클릭
5. 로그인 성공 확인
```

### 7-2. 글 작성

```
1. 하단 "글쓰기" 버튼 클릭
2. 카테고리 선택 (예: 💰 年収・手取り)
3. 내용 입력 (예: "テスト投稿です")
4. 닉네임 입력 (예: "テストユーザー")
5. "投稿" 버튼 클릭
6. "投稿が作成されました！" 알림 확인
```

### 7-3. Console 확인 (F12)

```
✅ "📝 Submit button clicked"
✅ "✅ Validation passed"
✅ "📝 Creating post with payload: { user_id: '...' }"
✅ "✅ Post created successfully in database"
✅ "🔄 Navigating to home page..."
```

### 7-4. 홈 화면 확인

```
1. 자동으로 홈 화면으로 이동
2. 방금 작성한 글이 맨 위에 표시되는지 확인
3. 좋아요 버튼 클릭해보기
4. 상세 페이지로 이동해보기
```

---

## ✅ 완료 체크리스트

```
□ 1. Supabase 프로젝트 생성
□ 2. Project URL & anon key 복사
□ 3. supabase_schema.sql 실행
□ 4. .env.local 파일 업데이트
□ 5. 서버 재시작 (rm -rf .next && npm run dev)
□ 6. 브라우저 완전 새로고침 (Cmd+Shift+R)
□ 7. Console에서 Supabase 경고 사라짐 확인
□ 8. 회원가입 테스트
□ 9. 글 작성 테스트
□ 10. 홈 화면에서 글 확인
```

---

## 🎉 성공!

**이제 다음 기능들을 사용할 수 있습니다:**

```
✅ 회원가입 & 로그인 (이메일/비밀번호)
✅ LINE 로그인
✅ 게시글 작성 & 저장
✅ 게시글 목록 조회
✅ 좋아요 기능
✅ 댓글 기능
✅ 알림 기능
✅ 실시간 업데이트 (Realtime)
✅ 마이페이지 통계
```

---

## 🐛 문제 해결

### Q1. "Supabase 경고가 여전히 나와요"

**해결:**
```
1. .env.local 파일 다시 확인
   - URL이 정확한지
   - anon key가 정확한지
   - 앞뒤 공백 없는지

2. 서버 완전 재시작
   터미널에서 Ctrl+C로 서버 종료
   rm -rf .next
   npm run dev

3. 브라우저 완전 새로고침
   Cmd+Shift+R
```

### Q2. "SQL 실행 시 에러가 나요"

**해결:**
```
1. SQL Editor에서 기존 쿼리 창 모두 닫기
2. "+ New query" 새로 시작
3. supabase_schema.sql 전체 복사
4. 붙여넣기
5. Run 버튼 클릭

에러 메시지 확인:
- "already exists" → 이미 생성됨 (정상)
- "permission denied" → Supabase 관리자 권한 확인
```

### Q3. "글을 써도 저장이 안 돼요"

**해결:**
```
1. F12 → Console 확인
2. 에러 메시지 찾기:
   - "❌ User not authenticated" → 다시 로그인
   - "❌ Supabase insert error" → RLS 정책 확인

3. Supabase Dashboard에서 확인:
   - Table Editor → posts 테이블
   - 데이터가 실제로 들어갔는지 확인
```

### Q4. ".env.local 파일을 어디서 여나요?"

**위치:**
```
/Users/yalekim/Desktop/honne/.env.local
```

**VS Code에서:**
```
1. 왼쪽 파일 탐색기
2. ".env.local" 파일 찾기
3. 더블클릭
```

---

## 📞 도움이 필요하면

Console의 에러 메시지를 **전체 복사**해서 알려주세요:

```
1. F12 → Console 탭
2. 에러 메시지 전체 선택 (Cmd+A)
3. 복사 (Cmd+C)
4. 텍스트로 전달
```

---

## 🎯 다음 단계

Supabase 설정이 완료되면:

```
✅ 실제 사용자 데이터 저장
✅ 프로덕션 배포 가능 (Vercel)
✅ LINE 로그인 활성화
✅ 실시간 알림 작동
```

---

**행운을 빕니다! 🚀**
