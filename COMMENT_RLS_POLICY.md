# 📝 댓글 기능 RLS 정책 확인 & 수정 가이드

## ✅ 코드 수정 완료

댓글 제출 기능이 완전히 구현되었습니다:

```typescript
✅ createComment 함수 추가 (useComments.ts)
✅ handleCommentSubmit 완전 구현 (posts/[id]/page.tsx)
✅ user_id, post_id, content, nickname 전달
✅ 상세한 에러 로깅
✅ 실시간 UI 업데이트 (자동 refetch)
✅ 로딩 상태 표시
```

---

## 🔍 Supabase RLS 정책 확인 필요

댓글이 저장되지 않는다면 **RLS 정책** 때문일 수 있습니다!

### 확인 방법:

#### Step 1: Supabase Dashboard 접속
```
https://supabase.com
→ honne 프로젝트
```

#### Step 2: Table Editor로 이동
```
왼쪽 메뉴: 📊 Table Editor
→ "comments" 테이블 선택
```

#### Step 3: RLS 상태 확인
```
테이블 상단에 이런 표시가 있나요?

┌─────────────────────────────────────┐
│  comments                           │
│  🔒 RLS enabled                     │  ← 이게 보이나요?
└─────────────────────────────────────┘

또는

┌─────────────────────────────────────┐
│  comments                           │
│  ⚠️  RLS disabled                   │
└─────────────────────────────────────┘
```

---

## ✅ RLS 정책이 제대로 설정되어 있는지 확인

### Step 1: Authentication → Policies로 이동

```
Supabase Dashboard:
1. Table Editor → comments 테이블
2. 우측 상단: "View policies" 또는 "Policies" 버튼 클릭
```

### Step 2: 필요한 정책 확인

**다음 정책들이 있어야 합니다:**

#### ✅ 1. SELECT 정책 (조회)
```
Policy name: "Comments are viewable by everyone"
Target roles: public
USING: true
```

#### ✅ 2. INSERT 정책 (작성)
```
Policy name: "Authenticated users can insert comments"
Target roles: authenticated
WITH CHECK: auth.uid() = user_id
```

#### ✅ 3. UPDATE 정책 (수정)
```
Policy name: "Users can update own comments"
Target roles: authenticated
USING: auth.uid() = user_id
```

#### ✅ 4. DELETE 정책 (삭제)
```
Policy name: "Users can delete own comments"
Target roles: authenticated
USING: auth.uid() = user_id
```

---

## 🚨 정책이 없다면? SQL 실행!

### Step 1: SQL Editor 열기

```
왼쪽 메뉴: 🔨 SQL Editor
→ "+ New query"
```

### Step 2: 다음 SQL 실행

```sql
-- Comments 테이블 RLS 활성화
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 1. 모든 사용자가 댓글 조회 가능
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

-- 2. 로그인한 사용자만 댓글 작성 가능
CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. 작성자만 자신의 댓글 수정 가능
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. 작성자만 자신의 댓글 삭제 가능
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### Step 3: Run 버튼 클릭

```
▶️ Run (또는 Cmd+Enter)
```

### Step 4: 성공 확인

```
✅ Success. No rows returned

또는

⚠️  "already exists" → 이미 있음 (정상)
```

---

## 🧪 테스트 순서

### 1️⃣ 서버 재시작

```bash
터미널에서:
rm -rf .next && npm run dev
```

### 2️⃣ 브라우저 새로고침

```
Cmd + Shift + R
```

### 3️⃣ 로그인 (필수!)

```
1. "ログイン" 버튼 클릭
2. 기본값이 "新規登録" 모드
3. 이메일: test@example.com
4. 비밀번호: password123 (6자 이상)
5. 비밀번호 확인: password123
6. "登録" 버튼 클릭
7. ✅ 로그인 성공 확인
```

### 4️⃣ 게시물 상세 페이지 이동

```
홈 화면에서 게시물 클릭
(게시물이 없으면 먼저 글 작성)
```

### 5️⃣ 댓글 작성

```
1. 하단 댓글 입력창
2. 댓글 내용 입력 (예: "テストコメントです")
3. "投稿" 버튼 클릭
4. Console (F12) 확인
```

---

## 📊 예상 Console 출력

### ✅ 성공 시:

```
💬 Creating comment with data: {
  post_id: "xxx",
  user_id: "yyy",
  content: "テストコメントです...",
  nickname: "名無し1234"
}
✅ Comment created successfully: { id: "...", ... }
💬 Fetching comments for post ID: xxx
✅ Loaded 1 comments from Supabase
```

### ❌ RLS 에러 시:

```
❌ Supabase insert error: {
  code: "42501",
  message: "new row violates row-level security policy"
}

→ SQL 정책을 실행해야 합니다!
```

### ❌ user_id 에러 시:

```
❌ User ID is missing

→ 다시 로그인 필요
```

---

## 🎯 완료 체크리스트

```
□ 코드 수정 완료 (자동 완료!)
□ 터미널: rm -rf .next && npm run dev
□ 브라우저: Cmd+Shift+R
□ 로그인: 회원가입 또는 로그인 완료
□ 게시물 상세 페이지 이동
□ 댓글 입력 & 제출
□ Console: 에러 확인
□ Supabase: RLS 정책 확인 (에러 시)
□ SQL 실행 (정책 없으면)
□ 댓글: 다시 제출
□ 성공: 댓글 목록에 표시됨!
```

---

## 🚀 **지금 바로 실행!**

```bash
rm -rf .next && npm run dev
```

그리고:
1. 브라우저 새로고침
2. 로그인 (회원가입)
3. 게시물 상세 페이지
4. 댓글 작성
5. Console 확인!

---

## 📞 결과 알려주세요!

다음을 확인:
- ✅ **Console에 어떤 메시지가 나오나요?**
- ✅ **"✅ Comment created successfully" 나오나요?**
- ✅ **RLS 에러가 나오나요?**

RLS 에러가 나오면 위의 SQL을 실행하면 됩니다! 😊