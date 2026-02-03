# 本音 (Honne) - 개발 규칙

## 📋 설정 완료

프로젝트에 개발 표준 규칙이 성공적으로 적용되었습니다.

### 🎯 적용된 규칙

#### 1. **Separation of Concerns (관심사 분리)**
- ✅ 비즈니스 로직은 `hooks`에 작성
- ✅ UI 컴포넌트는 프레젠테이션에만 집중
- 📁 위치: `src/features/[feature-name]/hooks/`

#### 2. **Type Safety (타입 안전성)**
- ✅ `any` 타입 사용 금지
- ✅ 모든 인터페이스는 `src/types/index.ts`에 정의
- ✅ 타입 체크 통과 확인됨

#### 3. **UI Consistency (UI 일관성)**
- ✅ Shadcn/UI 컴포넌트 사용
- ✅ Tailwind CSS 클래스 사용 (인라인 스타일 금지)
- ✅ 일본 웹 디자인 미학 적용
  - 충분한 여백
  - 미니멀한 디자인
  - 모바일 우선

#### 4. **Naming Convention (명명 규칙)**
- ✅ 함수/변수: `camelCase`
- ✅ 컴포넌트: `PascalCase`
- ✅ 상수: `UPPER_SNAKE_CASE`

#### 5. **Documentation (문서화)**
- ✅ 복잡한 로직에 JSDoc 주석 추가
- ✅ DB 스키마 변경 시 README.md 업데이트

#### 6. **I18n Ready (국제화 준비)**
- ✅ 반복되는 일본어 문자열을 상수 파일로 분리
- ✅ `src/lib/constants/ja.ts` 생성 및 적용

## 📁 생성된 파일

### 1. Cursor 규칙 파일
```
.cursor/rules/honne-dev-standards.mdc
```
- 모든 파일에 항상 적용되는 개발 표준
- AI 에이전트가 자동으로 참조

### 2. 일본어 상수 파일
```
src/lib/constants/ja.ts
```
- 모든 UI 텍스트를 중앙 집중식으로 관리
- 레이블, 카테고리, 메시지 등 포함

## 🔄 업데이트된 컴포넌트

다음 컴포넌트들이 새로운 규칙에 맞게 리팩토링되었습니다:

### ✅ `src/features/posts/PostCard.tsx`
- 하드코딩된 일본어 문자열을 상수로 변경
- `LABELS.EMPATHY`, `LABELS.COMMENT` 등 사용

### ✅ `src/components/ui/header.tsx`
- `LABELS.POST` 상수 사용

### ✅ `src/app/page.tsx`
- `CATEGORIES` 객체 사용
- `LABELS.WELCOME_TITLE`, `LABELS.LOAD_MORE` 등 적용

## 💡 사용 예시

### 새로운 컴포넌트 작성 시

```typescript
// ✅ GOOD - 규칙을 준수한 예시
import { LABELS } from "@/lib/constants/ja";
import { Button } from "@/components/ui/button";

export function MyComponent() {
  return (
    <Button>
      {LABELS.POST}
    </Button>
  );
}
```

### 새로운 Hook 작성 시

```typescript
// src/features/posts/hooks/usePosts.ts
import { useState, useEffect } from "react";
import { Post } from "@/types";

/**
 * 투고 목록을 가져오고 관리하는 Hook
 * @param category - 필터링할 카테고리 (optional)
 * @returns 투고 목록과 로딩 상태
 */
export function usePosts(category?: Post["category"]) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 비즈니스 로직...
  
  return { posts, isLoading };
}
```

## 🎨 상수 파일 구조

`src/lib/constants/ja.ts`에는 다음이 포함되어 있습니다:

- **LABELS**: 일반 레이블 (버튼, 링크 등)
- **CATEGORIES**: 카테고리 이름
- **PLACEHOLDERS**: 입력 필드 플레이스홀더
- **ERROR_MESSAGES**: 에러 메시지
- **SUCCESS_MESSAGES**: 성공 메시지

## 🚀 다음 단계

새로운 기능을 추가할 때:

1. **타입 정의**: `src/types/index.ts`에 인터페이스 추가
2. **비즈니스 로직**: `src/features/[feature]/hooks/` 에 커스텀 Hook 작성
3. **UI 컴포넌트**: `src/features/[feature]/` 또는 `src/components/ui/`에 작성
4. **상수 추가**: 새로운 일본어 문자열은 `src/lib/constants/ja.ts`에 추가

## ✅ 린터 상태

현재 모든 파일이 린터 검사를 통과했습니다:
- ❌ 에러: 0개
- ⚠️ 경고: 0개

## 📚 참고

개발 규칙에 대한 자세한 내용은 `.cursor/rules/honne-dev-standards.mdc` 파일을 참조하세요.
