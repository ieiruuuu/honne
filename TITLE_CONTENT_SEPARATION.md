# 📝 게시글 제목/본문 분리 기능 구현 완료! ✅

게시글 작성 및 표시에서 제목(Title)과 본문(Content)을 명확히 분리했습니다!

---

## 🎯 **구현 내용**

### **1. Database Schema 업데이트**

```sql
-- posts 테이블에 title 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT;

-- 검색 성능 향상을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);

-- 기존 게시글에 기본 제목 설정 (선택사항)
UPDATE posts 
SET title = SUBSTRING(content, 1, 50) || '...'
WHERE title IS NULL AND content IS NOT NULL;
```

### **2. 글쓰기 페이지 (Write Page)**

**UI 변경:**
```
기존:
┌─────────────────────────┐
│ 카테고리 선택            │
│ 본문 입력 (Textarea)     │
│ 닉네임 입력              │
└─────────────────────────┘

개선:
┌─────────────────────────┐
│ 카테고리 선택            │
│ 제목 입력 (Input) ✨     │ ← 새로 추가
│ 본문 입력 (Textarea)     │
│ 이미지 첨부              │
│ 닉네임 입력              │
└─────────────────────────┘
```

**필드 정보:**
- 제목: 2~100자, 필수 항목
- 본문: 1~500자, 필수 항목

### **3. 게시글 카드 (PostCard)**

**목록 뷰 변경:**

```tsx
// Before (제목 없음)
┌─────────────────────────────────┐
│ 닉네임  시간  [카테고리]        │
│                                 │
│ 본문 전체가 표시됨...           │
│ 여러 줄에 걸쳐서...             │
│                                 │
│ [좋아요] [댓글]                 │
└─────────────────────────────────┘

// After (제목 분리)
┌─────────────────────────────────┐
│ 닉네임  시간  [카테고리]        │
│                                 │
│ 제목이 여기에 굵게 ✨           │
│ 표시됩니다 (최대 2줄)           │
│                                 │
│ 본문 미리보기 (최대 2줄)...     │
│                                 │
│ [좋아요] [댓글]                 │
└─────────────────────────────────┘
```

**스타일:**
```tsx
// 제목
<h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
  {post.title}
</h3>

// 본문 미리보기
<p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
  {post.content}
</p>
```

### **4. 게시글 상세 페이지 (Post Detail)**

**상세 뷰 변경:**

```tsx
// Before
┌─────────────────────────────────┐
│ ← 戻る      [카테고리]          │
│                                 │
│ 닉네임                          │
│                                 │
│ 본문 내용이 여기부터 시작...     │
│ 전체가 표시됨                    │
│                                 │
│ [좋아요] [댓글]                 │
└─────────────────────────────────┘

// After
┌─────────────────────────────────┐
│ ← 戻る      [카테고리]          │
│                                 │
│ 닉네임                          │
│                                 │
│ 제목이 크게 표시됨 ✨           │
│                                 │
│ 본문 내용이 여기부터 시작...     │
│ 전체가 표시됨                    │
│                                 │
│ [좋아요] [댓글]                 │
└─────────────────────────────────┘
```

**스타일:**
```tsx
// 제목 (대형)
<h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
  {post.title}
</h1>

// 본문 (표준)
<p className="text-base leading-relaxed whitespace-pre-wrap mb-4">
  {post.content}
</p>
```

---

## 📊 **텍스트 계층 구조**

### **PostCard (목록)**

| 요소 | 크기 | 굵기 | 색상 | 줄 제한 |
|------|------|------|------|---------|
| 제목 | `text-lg` (18px) | `font-bold` | `text-gray-900` | 2줄 |
| 본문 | `text-sm` (14px) | 일반 | `text-gray-600` | 2줄 |

### **Post Detail (상세)**

| 요소 | 크기 | 굵기 | 색상 | 줄 제한 |
|------|------|------|------|---------|
| 제목 | `text-2xl` (24px) | `font-bold` | `text-gray-900` | 없음 |
| 본문 | `text-base` (16px) | 일반 | `text-gray-900` | 없음 |

---

## 🎨 **시각적 비교**

### **Before (제목 없음)**

```
┌──────────────────────────────┐
│ 오늘 회사에서 정말 힘든 일이  │
│ 있었어요. 상사가 갑자기 회의 │
│ 중에 소리를 지르고...        │
│                              │
│ ❤️ 5  💬 2                   │
└──────────────────────────────┘
  → 제목인지 본문인지 불명확
```

### **After (제목 분리)**

```
┌──────────────────────────────┐
│ 상사의 갑질이 너무 심함 ✨    │ ← 제목 (굵고 큼)
│                              │
│ 오늘 회사에서 정말 힘든...   │ ← 본문 미리보기
│                              │
│ ❤️ 5  💬 2                   │
└──────────────────────────────┘
  → 한눈에 파악 가능!
```

---

## ✅ **수정된 파일**

### **1. SQL 스키마**
- `supabase_add_title.sql` ✨
  - `title` 컬럼 추가
  - 인덱스 생성
  - 기존 데이터 마이그레이션

### **2. TypeScript 타입**
- `src/types/index.ts`
  ```typescript
  export interface Post {
    id: string;
    title?: string; // ✨ 추가
    content: string;
    category: Category;
    nickname: string;
    likes_count: number;
    user_id?: string;
    image_url?: string;
    created_at: string;
  }
  ```

### **3. 글쓰기 페이지**
- `src/app/write/page.tsx`
  ```tsx
  // 상태 추가
  const [title, setTitle] = useState("");
  
  // UI 추가
  <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="タイトルを入力してください（2文字以上）"
    maxLength={100}
  />
  
  // 유효성 검사
  if (title.trim().length < 2) {
    alert("タイトルは2文字以上入力してください");
    return;
  }
  
  // 전송
  await createPost({
    title: title.trim(),
    content: content.trim(),
    // ...
  });
  ```

### **4. 게시글 생성 훅**
- `src/features/feed/hooks/useCreatePost.ts`
  ```typescript
  interface CreatePostData {
    title: string; // ✨ 추가
    content: string;
    category: Category;
    nickname: string;
    image_url?: string;
  }
  
  // 유효성 검사 추가
  if (data.title.trim().length < 2) {
    errors.push({ field: "title", message: "タイトルは2文字以上" });
  }
  
  // DB 삽입
  const insertPayload = {
    title: data.title.trim(), // ✨ 추가
    content: data.content.trim(),
    // ...
  };
  ```

### **5. 게시글 카드**
- `src/features/posts/PostCard.tsx`
  ```tsx
  <CardContent className="pb-3">
    {/* タイトル */}
    {post.title && (
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {post.title}
      </h3>
    )}
    
    {/* 本文プレビュー */}
    <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
      {post.content}
    </p>
  </CardContent>
  ```

### **6. 게시글 상세**
- `src/app/posts/[id]/page.tsx`
  ```tsx
  {/* タイトル */}
  {post.title && (
    <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
      {post.title}
    </h1>
  )}
  
  {/* 本文 */}
  <p className="text-base leading-relaxed whitespace-pre-wrap mb-4">
    {post.content}
  </p>
  ```

---

## 🚀 **적용 방법**

### **1단계: SQL 실행**

Supabase Dashboard → SQL Editor에서 실행:

```sql
-- supabase_add_title.sql 내용 실행
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT;
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);
```

### **2단계: 앱 재시작**

```bash
# 개발 서버 재시작
npm run dev
```

### **3단계: 테스트**

```
1. 글쓰기 페이지 접속
2. ✅ 제목 입력 필드 확인
3. 제목 + 본문 입력
4. 게시
5. ✅ 홈 화면에서 제목이 굵게 표시됨
6. 게시글 클릭
7. ✅ 상세 페이지에서 제목이 크게 표시됨
```

---

## 🧪 **테스트 시나리오**

### **시나리오 1: 새 게시글 작성**

```
1. 글쓰기 페이지 접속
2. 제목: "今日の愚痴"
3. 본문: "上司がまた無理な仕事を押し付けてきた..."
4. 카테고리: "人間関係・上司"
5. 게시
6. ✅ 홈에서 제목이 볼드로 표시
7. ✅ 본문은 미리보기 (2줄)
8. 클릭 → 상세 페이지
9. ✅ 제목이 크게 (text-2xl)
10. ✅ 본문이 전체 표시
```

### **시나리오 2: 제목 없이 작성 시도**

```
1. 글쓰기 페이지
2. 제목: (비워둠)
3. 본문: "내용만 입력"
4. 게시 버튼 클릭
5. ✅ 알림: "タイトルは2文字以上入力してください"
6. ✅ 게시 안 됨
```

### **시나리오 3: 제목 1자 입력**

```
1. 제목: "あ" (1자)
2. 본문: "내용..."
3. 게시 버튼 클릭
4. ✅ 알림: "タイトルは2文字以上入力してください"
```

### **시나리오 4: 긴 제목**

```
1. 제목: "あいうえお..." (101자)
2. ✅ 입력 제한 (maxLength={100})
3. 100자까지만 입력 가능
```

### **시나리오 5: 기존 게시글 (title 없음)**

```
1. 기존 게시글 조회
2. ✅ title이 없으면 제목 영역 숨김
3. ✅ 본문만 표시 (기존 방식)
4. ✅ 하위 호환성 유지
```

---

## 🎨 **디자인 세부사항**

### **PostCard (목록)**

```tsx
{/* 제목 */}
className="text-lg font-bold text-gray-900 mb-2 line-clamp-2"
// 18px, 굵게, 검은색, 최대 2줄

{/* 본문 */}
className="text-sm leading-relaxed text-gray-600 line-clamp-2"
// 14px, 일반, 회색, 최대 2줄
```

**시각적 계층:**
```
제목: 크고 굵고 검은색
  ↓
본문: 작고 일반이며 회색
  ↓
명확한 위계 구조
```

### **Post Detail (상세)**

```tsx
{/* 제목 */}
className="text-2xl font-bold text-gray-900 mb-4 leading-tight"
// 24px, 굵게, 검은색, 줄 제한 없음

{/* 본문 */}
className="text-base leading-relaxed whitespace-pre-wrap mb-4"
// 16px, 일반, 검은색, 줄 제한 없음
```

---

## 📐 **line-clamp 설명**

### **line-clamp-2**

```css
/* Tailwind CSS 유틸리티 */
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
```

**효과:**
```
긴 텍스트가 있을 때:
"이것은 매우 긴 제목입니다. 아주 아주 길어서 여러 줄에 걸쳐서 표시될 수 있습니다만 최대 2줄까지만 보이고 나머지는..."

↓

"이것은 매우 긴 제목입니다. 아주 아주 길어서 여러 줄에 걸쳐서 표시될 수 있습니다만 최대 2줄까지만..."
```

---

## 🔧 **Validation 규칙**

### **제목 (Title)**

| 규칙 | 값 | 에러 메시지 |
|------|-----|-------------|
| 필수 | ✅ | "タイトルを入力してください" |
| 최소 길이 | 2자 | "タイトルは2文字以上入力してください" |
| 최대 길이 | 100자 | "タイトルは100文字以内にしてください" |

### **본문 (Content)**

| 규칙 | 값 | 에러 메시지 |
|------|-----|-------------|
| 필수 | ✅ | "内容を入力してください" |
| 최소 길이 | 1자 | "内容が短すぎます" |
| 최대 길이 | 500자 | "内容は500文字以内にしてください" |

---

## 📁 **파일 구조**

```
/Users/yalekim/Desktop/honne/
├── supabase_add_title.sql ✨         # SQL 마이그레이션
├── src/
│   ├── types/index.ts                # Post 인터페이스 업데이트
│   ├── app/
│   │   ├── write/page.tsx            # 제목 입력 필드 추가
│   │   └── posts/[id]/page.tsx       # 제목 크게 표시
│   └── features/
│       ├── feed/hooks/
│       │   └── useCreatePost.ts      # title 필드 추가
│       └── posts/
│           └── PostCard.tsx          # 제목/본문 분리 표시
└── TITLE_CONTENT_SEPARATION.md ✨    # 가이드
```

---

## 🐛 **트러블슈팅**

### **문제 1: 제목이 표시되지 않음**

**원인**: SQL 마이그레이션 미실행

**해결:**
```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT;
```

---

### **문제 2: 기존 게시글이 깨짐**

**원인**: title이 NULL인 기존 데이터

**해결:**
```tsx
// 조건부 렌더링으로 안전하게 처리
{post.title && (
  <h3>{post.title}</h3>
)}
```

---

### **문제 3: 제목 입력해도 게시 안 됨**

**원인**: 유효성 검사 실패

**해결:**
1. 브라우저 콘솔 확인
2. 제목이 2자 이상인지 확인
3. 모든 필수 항목 입력 확인

---

## ✅ **완료 체크리스트**

- [x] SQL: `posts` 테이블에 `title` 컬럼 추가
- [x] SQL: 인덱스 생성
- [x] Types: `Post` 인터페이스에 `title` 추가
- [x] Write Page: 제목 입력 필드 추가
- [x] Write Page: 제목 유효성 검사 (2~100자)
- [x] useCreatePost: `title` 필드 처리
- [x] PostCard: 제목 볼드 표시, 본문 미리보기 (2줄)
- [x] Post Detail: 제목 크게 표시 (text-2xl)
- [x] 하위 호환성: title 없는 기존 게시글 대응

---

## 🚀 **다음 단계**

1. **SQL 실행**
   ```sql
   -- Supabase SQL Editor
   ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT;
   CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);
   ```

2. **앱 테스트**
   ```bash
   npm run dev
   ```

3. **게시글 작성 테스트**
   - 제목 + 본문 입력
   - 목록에서 확인
   - 상세 페이지 확인

---

**완료!** 🎉✨

게시글이 제목과 본문으로 명확히 분리되어 가독성이 크게 향상되었습니다!
