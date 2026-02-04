# 🔍 빈 화면 문제 진단 결과

## ❌ 발견된 문제

### 1. **Supabase 환경 변수 미설정** (Critical)

**현재 상태 (`.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**문제:**
- ❌ Placeholder 값으로 설정됨
- ❌ 실제 Supabase 프로젝트에 연결되지 않음
- ❌ 모든 데이터 쿼리가 실패함

**결과:**
```typescript
// usePost.ts
const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

if (!isSupabaseConfigured) {
  console.warn("⚠️ Supabase is not configured");
  setError("NOT_FOUND");  // ← 이것 때문에 빈 화면 표시
  return;
}
```

---

## ✅ 해결 방법

### Step 1: Supabase 프로젝트 정보 확인

1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard
   ```

2. **프로젝트 선택 → Settings → API**

3. **다음 정보 복사:**
   - Project URL: `https://xxxxxxxxxxxxx.supabase.co`
   - anon public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### Step 2: `.env.local` 파일 업데이트

**수정 전:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**수정 후:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[YOUR_ACTUAL_KEY]
```

**예시:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjI0MzU2MCwiZXhwIjoxOTMxODE5NTYwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Step 3: 개발 서버 재시작

```bash
# 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
```

**중요:** `.env.local` 파일 변경 후 반드시 서버를 재시작해야 합니다!

---

## 🔧 추가 개선 사항

### 1. 에러 메시지 개선

현재 코드는 환경 변수가 없을 때 즉시 "NOT_FOUND"를 반환합니다.
사용자가 문제를 파악하기 어렵습니다.

**개선된 코드:**

```typescript
// src/features/posts/hooks/usePost.ts
if (!isSupabaseConfigured) {
  console.error("❌ Supabase is not configured! Check .env.local");
  console.error("Current URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.error("Current Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing");
  
  setError("SUPABASE_NOT_CONFIGURED");
  setIsLoading(false);
  return;
}
```

### 2. 브라우저 콘솔 디버깅

브라우저 개발자 도구 (F12) → Console 탭에서 다음 메시지 확인:

```
⚠️ Supabase is not configured
🔍 Fetching post with ID: [post_id]
```

이 메시지가 보이면 환경 변수가 제대로 설정되지 않은 것입니다.

---

## 📊 데이터베이스 스키마 확인

환경 변수를 설정한 후에도 문제가 있다면:

### 1. `posts` 테이블 스키마 확인

**필수 컬럼:**
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  nickname TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**타입 확인:**
- ✅ `id`: UUID 형식
- ✅ `content`, `category`, `nickname`: TEXT
- ✅ `likes_count`, `comments_count`: INTEGER
- ✅ `created_at`: TIMESTAMP

### 2. Row Level Security (RLS) 설정

```sql
-- posts 테이블에 대한 읽기 권한 허용
CREATE POLICY "Allow public read access" 
ON posts 
FOR SELECT 
USING (true);
```

Supabase Dashboard → Table Editor → posts → Policies에서 확인

---

## 🧪 테스트 절차

### 1. 환경 변수 설정 후

```bash
# 서버 재시작
npm run dev
```

### 2. 브라우저 콘솔 확인

```
http://localhost:3000

F12 → Console 탭
```

**기대하는 로그:**
```
🔍 Fetching post with ID: [id]
🗄️ Fetching from Supabase...
✅ Post loaded from Supabase: { id: "...", content: "...", ... }
```

**에러가 있다면:**
```
❌ Supabase error: { message: "...", code: "..." }
```

### 3. 네트워크 요청 확인

```
F12 → Network 탭 → Filter: "supabase"
```

**기대하는 요청:**
```
GET https://[your-project].supabase.co/rest/v1/posts?id=eq.[post_id]&select=*
Status: 200 OK
```

**에러가 있다면:**
```
Status: 401 Unauthorized (잘못된 API Key)
Status: 404 Not Found (데이터 없음)
Status: 500 Internal Server Error (RLS 정책 문제)
```

---

## 📋 체크리스트

### 환경 변수 설정
```
□ Supabase Dashboard에서 Project URL 복사
□ Supabase Dashboard에서 anon key 복사
□ .env.local 파일 업데이트
□ 개발 서버 재시작
□ 브라우저 새로고침 (Hard Refresh: Cmd+Shift+R)
```

### 데이터베이스 확인
```
□ posts 테이블 존재 확인
□ posts 테이블에 데이터 있음
□ id 컬럼이 UUID 타입
□ RLS 정책 설정됨 (읽기 권한)
```

### 테스트
```
□ 브라우저 콘솔 에러 없음
□ 네트워크 요청 200 OK
□ 상세 페이지에 데이터 표시
□ 마이페이지에 통계 표시
```

---

## 🚨 여전히 빈 화면이라면

### 1. 캐시 삭제

```bash
# Next.js 캐시 삭제
rm -rf .next

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 서버 재시작
npm run dev
```

### 2. 하드코딩 테스트

임시로 하드코딩하여 환경 변수 문제인지 확인:

```typescript
// src/lib/supabase.ts (테스트용, 절대 커밋하지 마세요!)
const supabaseUrl = "https://[YOUR_ACTUAL_PROJECT].supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[YOUR_ACTUAL_KEY]";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

이렇게 했을 때 작동하면 환경 변수 로딩 문제입니다.

### 3. Supabase 연결 테스트

간단한 테스트 페이지 생성:

```typescript
// src/app/test/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const [status, setStatus] = useState("Testing...");

  useEffect(() => {
    async function test() {
      try {
        const { data, error } = await supabase.from("posts").select("count");
        
        if (error) {
          setStatus(`Error: ${error.message}`);
        } else {
          setStatus(`Success! Found ${data?.length || 0} posts`);
        }
      } catch (err) {
        setStatus(`Exception: ${err}`);
      }
    }
    test();
  }, []);

  return (
    <div className="p-8">
      <h1>Supabase Connection Test</h1>
      <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
      <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not Set"}</p>
      <p>Status: {status}</p>
    </div>
  );
}
```

접속: `http://localhost:3000/test`

---

## 💡 요약

### 주요 원인
```
❌ .env.local의 Supabase URL/Key가 placeholder
```

### 해결 방법
```
1. Supabase Dashboard → Settings → API
2. Project URL & anon key 복사
3. .env.local 파일 업데이트
4. npm run dev 재시작
5. 브라우저 새로고침
```

### 확인 방법
```
F12 → Console → 에러 메시지 확인
F12 → Network → Supabase 요청 확인
```

---

**환경 변수를 올바르게 설정하면 즉시 해결됩니다!** 🎯

만약 Supabase 프로젝트가 없다면:
1. https://supabase.com 에서 새 프로젝트 생성
2. 테이블 생성
3. 환경 변수 설정

추가 도움이 필요하면 언제든 말씀해주세요! 😊
