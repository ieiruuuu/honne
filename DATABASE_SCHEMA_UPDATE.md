# 데이터베이스 스키마 업데이트

## 📋 변경 사항 요약

데이터베이스 스키마가 익명 커뮤니티에 맞게 업데이트되었습니다.

### 주요 변경사항

#### 1. **Users 테이블 제거**
- ✅ 완전한 익명 시스템으로 전환
- ✅ `nickname` 필드로 사용자 식별

#### 2. **Posts 테이블 변경**

**Before:**
```typescript
interface Post {
  id: string;
  user_id: string;           // ❌ 제거
  content: string;
  category: "悩み" | ...;    // ❌ 변경
  empathy_count: number;     // ❌ 변경
  comment_count: number;     // ❌ 제거
  created_at: string;
  updated_at: string;        // ❌ 제거
}
```

**After:**
```typescript
interface Post {
  id: string;
  content: string;
  category: string;          // ✅ '인간관계', '급여', '블랙기업' 등
  nickname: string;          // ✅ 추가 (익명 닉네임)
  likes_count: number;       // ✅ 변경 (empathy_count → likes_count)
  created_at: string;
}
```

#### 3. **Comments 테이블 변경**

**Before:**
```typescript
interface Comment {
  id: string;
  post_id: string;
  user_id: string;           // ❌ 제거
  content: string;
  created_at: string;
}
```

**After:**
```typescript
interface Comment {
  id: string;
  post_id: string;
  content: string;
  nickname: string;          // ✅ 추가 (익명 닉네임)
  created_at: string;
}
```

## 🗃️ SQL 스키마

### Posts 테이블
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  nickname TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Comments 테이블
```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 인덱스
```sql
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX posts_category_idx ON posts(category);
CREATE INDEX comments_post_id_idx ON comments(post_id);
```

## 🎨 카테고리 변경

### 이전 카테고리 (일본어)
- 悩み (고민)
- 愚痴 (불만)
- 質問 (질문)
- 雑談 (잡담)

### 새로운 카테고리 (한국어)
- **인간관계** - 직장 내 인간관계 고민
- **급여** - 급여, 보너스 관련
- **블랙기업** - 불법, 부당한 대우
- **커리어** - 이직, 커리어 개발
- **직장생활** - 일반적인 직장 생활

## 📝 코드 변경사항

### 1. TypeScript 타입 정의
**파일:** `src/types/index.ts`

```typescript
// User 인터페이스 제거됨

export interface Post {
  id: string;
  content: string;
  category: string;
  nickname: string;      // NEW
  likes_count: number;   // CHANGED from empathy_count
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  nickname: string;      // NEW (replaced user_id)
  created_at: string;
}
```

### 2. 상수 업데이트
**파일:** `src/lib/constants/ja.ts`

```typescript
export const CATEGORIES = {
  ALL: "すべて",
  RELATIONSHIPS: "인간관계",    // NEW
  SALARY: "급여",               // NEW
  BLACK_COMPANY: "블랙기업",     // NEW
  CAREER: "커리어",             // NEW
  WORKPLACE: "직장생활",         // NEW
} as const;

export const LABELS = {
  LIKES: "いいね",      // CHANGED from EMPATHY
  // ... 기타 레이블
} as const;
```

### 3. PostCard 컴포넌트
**파일:** `src/features/posts/PostCard.tsx`

주요 변경사항:
- ✅ `nickname` 표시 (아바타에 첫 글자)
- ✅ `likes_count` 사용 (empathy_count 대체)
- ✅ `commentCount` props로 전달 (DB에 없으므로)
- ✅ 동적 카테고리 색상 매핑

```typescript
interface PostCardProps {
  post: Post;
  commentCount?: number;  // NEW - optional prop
}

// 동적 카테고리 색상
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    "인간관계": "bg-blue-100 text-blue-800 border-blue-200",
    "급여": "bg-green-100 text-green-800 border-green-200",
    "블랙기업": "bg-red-100 text-red-800 border-red-200",
    "커리어": "bg-purple-100 text-purple-800 border-purple-200",
    "직장생활": "bg-orange-100 text-orange-800 border-orange-200",
  };
  return colorMap[category] || "bg-gray-100 text-gray-800 border-gray-200";
};
```

### 4. 홈페이지 (page.tsx)
**파일:** `src/app/page.tsx`

- ✅ 새로운 카테고리로 업데이트
- ✅ 모크 데이터를 새 스키마에 맞게 수정

## 🔄 마이그레이션 가이드

### Supabase에서 스키마 적용하기

1. **Supabase Dashboard** 접속
2. **SQL Editor** 열기
3. 다음 SQL 실행:

```sql
-- 기존 테이블이 있다면 삭제 (주의: 데이터 손실!)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

-- 새 스키마 생성
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  nickname TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX posts_category_idx ON posts(category);
CREATE INDEX comments_post_id_idx ON comments(post_id);
```

## ✅ 검증 완료

- ✅ TypeScript 타입 체크 통과
- ✅ 린터 에러 없음
- ✅ 모든 컴포넌트 업데이트 완료
- ✅ 문서 업데이트 완료 (README.md, SETUP.md)

## 🎯 다음 단계

1. **Supabase 설정**
   - SQL 스키마 실행
   - 테이블 생성 확인

2. **API 연동**
   - Supabase 클라이언트로 데이터 가져오기/저장하기
   - 실시간 구독 설정 (옵션)

3. **기능 구현**
   - 게시글 작성 폼
   - 좋아요 기능
   - 댓글 기능

## 📚 참고 파일

- `README.md` - 업데이트된 데이터베이스 스키마
- `SETUP.md` - 설정 가이드
- `src/types/index.ts` - TypeScript 타입 정의
- `src/lib/constants/ja.ts` - 카테고리 상수
