# 🚀 Supabase 설정 가이드

## 📊 현재 상태

```
⚠️ Supabase configuration not properly set.
URL: https://placeholder.supabase.co
Key: (set but may be placeholder)
```

**이 경고는 정상입니다!**

코드가 Supabase가 설정되지 않았음을 감지하고 **안전하게 처리**하고 있습니다.
- ✅ 앱은 크래시 없이 작동
- ✅ Empty State UI 표시
- ⚠️ 데이터 저장/불러오기 불가

---

## 🎯 2가지 선택지

### 옵션 1: 그대로 사용 (테스트/개발)

**장점:**
- 설정 없이 바로 사용 가능
- UI/UX 테스트 가능
- 앱 크래시 없음

**단점:**
- 실제 데이터 저장 안 됨
- 로그인 불가
- 게시글 작성 안 됨
- 알림 기능 사용 불가

**현재 동작:**
```
✅ 홈 화면 표시 (빈 상태)
✅ 글쓰기 페이지 접근 가능
✅ 카테고리 페이지 작동
❌ 실제 데이터 저장 불가
❌ 로그인 불가
```

---

### 옵션 2: Supabase 설정 (실제 사용)

**필요한 작업:**
1. Supabase 계정 생성
2. 프로젝트 생성
3. 데이터베이스 테이블 생성
4. `.env.local` 파일 업데이트
5. 서버 재시작

**가능해지는 것:**
```
✅ 실제 게시글 저장
✅ 로그인/회원가입
✅ 댓글 작성
✅ 좋아요 기능
✅ 알림 기능
✅ 실시간 업데이트
```

---

## 🔧 Supabase 설정 방법 (옵션 2)

### 1단계: Supabase 계정 생성

```
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 또는 이메일로 가입
```

---

### 2단계: 새 프로젝트 생성

```
1. Dashboard에서 "New Project" 클릭
2. 프로젝트 이름: "honne" (또는 원하는 이름)
3. Database Password: 안전한 비밀번호 입력
4. Region: Northeast Asia (Seoul) 선택
5. "Create new project" 클릭
6. 프로젝트 생성 완료 (약 2분 소요)
```

---

### 3단계: API 키 가져오기

```
1. Dashboard에서 "Settings" → "API" 클릭
2. 다음 정보 복사:
   - Project URL: https://xxxxx.supabase.co
   - anon public key: eyJhbGciOi... (긴 문자열)
```

---

### 4단계: `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용 입력:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi... (실제 키 입력)

# LINE Login (나중에 설정)
NEXT_PUBLIC_LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
```

**⚠️ 중요:**
- `xxxxx.supabase.co` 부분을 실제 URL로 교체
- `eyJhbGciOi...` 부분을 실제 anon key로 교체
- `.env.local` 파일은 `.gitignore`에 포함되어 GitHub에 올라가지 않습니다

---

### 5단계: 데이터베이스 테이블 생성

Supabase Dashboard → "SQL Editor" → "New query"에서 다음 SQL 실행:

```sql
-- Users 테이블 (Supabase Auth 사용 시 자동 생성됨)

-- Posts 테이블
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  nickname TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Likes 테이블
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Comments 테이블
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications 테이블
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- RLS (Row Level Security) 정책
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Posts 정책
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Post Likes 정책
CREATE POLICY "Likes are viewable by everyone"
  ON post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comments 정책
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Notifications 정책
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

**실행:**
1. 위 SQL을 복사
2. Supabase Dashboard → SQL Editor → "New query"
3. 붙여넣기
4. "Run" 버튼 클릭

---

### 6단계: 서버 재시작

```bash
# 터미널에서 실행
rm -rf .next && npm run dev
```

**완전 새로고침:**
```
브라우저: Cmd+Shift+R
```

---

## ✅ 설정 완료 확인

### Console 확인

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

### 기능 테스트

```
1. 로그인 테스트:
   - 우측 상단 로그인 버튼 클릭
   - 이메일/비밀번호로 회원가입
   - 로그인 성공 확인

2. 글 작성 테스트:
   - 하단 "글쓰기" 버튼 클릭
   - 카테고리 선택
   - 내용 입력
   - 닉네임 입력
   - "投稿" 버튼 클릭
   - Console: "✅ Post created successfully"

3. 홈 화면 확인:
   - 새 글이 맨 위에 표시되는지 확인
   - 좋아요 버튼 작동 확인
```

---

## 🎯 icon.png 500 에러 해결

**문제:**
```
GET http://localhost:3000/icon.png 500 (Internal Server Error)
```

**해결 (자동으로 처리됨):**
```bash
# icon.png가 logo.png로 복사됨
public/icon.png ✅
```

**서버 재시작:**
```bash
rm -rf .next && npm run dev
```

---

## 📊 요약

### 현재 상태 (Supabase 미설정)

```
✅ 앱 정상 작동 (UI/UX)
✅ 경고 안전하게 처리됨
⚠️ Empty State 표시
❌ 데이터 저장 불가
❌ 로그인 불가
```

### Supabase 설정 후

```
✅ 실제 데이터 저장
✅ 로그인/회원가입
✅ 게시글 작성
✅ 댓글 기능
✅ 좋아요 기능
✅ 알림 기능
✅ 실시간 업데이트
```

---

## 💡 추가 팁

### `.env.local` 파일 예시

```bash
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LINE Login (선택 - 나중에 설정)
NEXT_PUBLIC_LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
```

### `.env.local` 파일 위치

```
honne/
├── .env.local          ← 여기에 생성
├── .env.local.example  ← 예시 파일
├── src/
├── public/
└── package.json
```

### Supabase Dashboard 주소

```
https://app.supabase.com/project/[your-project-id]
```

---

## 🎉 완료!

**옵션 1 선택 (그대로 사용):**
- 아무 작업 필요 없음
- 경고는 무시해도 됨 (정상)
- UI/UX 테스트 가능

**옵션 2 선택 (Supabase 설정):**
1. Supabase 계정 생성
2. 프로젝트 생성
3. API 키 복사
4. `.env.local` 파일 생성
5. SQL 실행
6. 서버 재시작

**추천:** 실제 기능을 사용하려면 **옵션 2**를 선택하세요!
