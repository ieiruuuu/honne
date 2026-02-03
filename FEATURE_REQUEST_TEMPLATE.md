# Feature Request Template

## 📋 기능 요청 양식

새로운 기능을 요청할 때 다음 형식을 사용해주세요.

```markdown
# Feature Request: [기능 이름]

- **Goal:** [어떤 기능을 만들고 싶은지]
- **Location:** `src/features/[기능이름]` 폴더에 구현해줘.
- **Requirement:**
  - 비즈니스 로직은 `use[기능이름].ts` 훅으로 분리할 것.
  - 관련 타입은 `src/types`에 추가할 것.
  - UI는 기존 테마와 일관성을 유지할 것.
```

## 📝 작성 가이드

### 1. **Goal (목표)**
- 구현하고자 하는 기능을 명확하게 설명
- 사용자 관점에서 기술
- 예: "사용자가 게시글을 작성하고 카테고리를 선택할 수 있는 기능"

### 2. **Location (위치)**
- 기능별로 폴더 구조 분리
- 형식: `src/features/[기능이름]/`
- 예: `src/features/post-form/`

### 3. **Requirement (요구사항)**
프로젝트의 개발 규칙을 자동으로 적용합니다:
- ✅ **Separation of Concerns**: 비즈니스 로직은 hooks에
- ✅ **Type Safety**: 타입은 `src/types`에 정의
- ✅ **UI Consistency**: Shadcn/UI + Tailwind CSS
- ✅ **I18n Ready**: 일본어 문자열은 `src/lib/constants/ja.ts`에

## 💡 기능 구현 시 자동으로 생성되는 파일 구조

```
src/features/[기능이름]/
├── index.tsx                    # 메인 컴포넌트
├── [서브컴포넌트].tsx           # 추가 UI 컴포넌트
└── hooks/
    └── use[기능이름].ts         # 비즈니스 로직

src/types/
└── index.ts                     # 타입 추가

src/lib/constants/
└── ja.ts                        # 필요시 레이블 추가
```

---

## 🎯 예시 1: 게시글 작성 기능

```markdown
# Feature Request: 게시글 작성 (Post Form)

- **Goal:** 사용자가 게시글을 작성하고, 닉네임과 카테고리를 선택하여 Supabase에 저장할 수 있는 기능을 만들고 싶습니다.

- **Location:** `src/features/post-form` 폴더에 구현해줘.

- **Requirement:**
  - 비즈니스 로직은 `usePostForm.ts` 훅으로 분리할 것.
  - Post 관련 타입이 이미 있으므로 필요시 추가할 것.
  - UI는 기존 테마(일본 미니멀리즘)와 일관성을 유지할 것.
  - 카테고리는 상수 파일의 CATEGORIES 사용할 것.
```

**생성될 파일:**
```
src/features/post-form/
├── PostForm.tsx                 # 폼 UI 컴포넌트
├── PostFormDialog.tsx           # 다이얼로그 래퍼 (옵션)
└── hooks/
    └── usePostForm.ts           # 폼 상태 & 제출 로직
```

---

## 🎯 예시 2: 좋아요 기능

```markdown
# Feature Request: 좋아요 (Likes)

- **Goal:** 사용자가 게시글에 좋아요를 누를 수 있고, 실시간으로 카운트가 업데이트되는 기능을 만들고 싶습니다.

- **Location:** `src/features/posts` 폴더에 추가해줘 (기존 PostCard 확장).

- **Requirement:**
  - 비즈니스 로직은 `useLikes.ts` 훅으로 분리할 것.
  - 중복 좋아요 방지 로직 포함할 것.
  - UI는 하트 아이콘 클릭 시 애니메이션 추가할 것.
```

**생성될 파일:**
```
src/features/posts/
├── PostCard.tsx                 # 기존 파일 (업데이트)
└── hooks/
    ├── usePosts.ts              # 기존 또는 신규
    └── useLikes.ts              # 좋아요 로직
```

---

## 🎯 예시 3: 댓글 기능

```markdown
# Feature Request: 댓글 (Comments)

- **Goal:** 사용자가 게시글에 댓글을 작성하고, 댓글 목록을 볼 수 있는 기능을 만들고 싶습니다.

- **Location:** `src/features/comments` 폴더에 구현해줘.

- **Requirement:**
  - 비즈니스 로직은 `useComments.ts` 훅으로 분리할 것.
  - Comment 타입이 이미 있으므로 확인 후 사용할 것.
  - UI는 PostCard와 일관된 디자인으로 할 것.
  - 댓글 입력 폼과 댓글 리스트 컴포넌트 분리할 것.
```

**생성될 파일:**
```
src/features/comments/
├── CommentList.tsx              # 댓글 목록
├── CommentItem.tsx              # 개별 댓글
├── CommentForm.tsx              # 댓글 작성 폼
└── hooks/
    └── useComments.ts           # 댓글 CRUD 로직
```

---

## ⚠️ 주의사항

### 자동으로 적용되는 개발 규칙

기능 구현 시 다음 규칙들이 자동으로 적용됩니다:

1. **타입 안전성**
   - `any` 타입 금지
   - 모든 인터페이스는 `src/types/index.ts`에 정의

2. **명명 규칙**
   - 컴포넌트: `PascalCase`
   - 함수/변수: `camelCase`
   - 상수: `UPPER_SNAKE_CASE`

3. **비즈니스 로직 분리**
   - UI 컴포넌트에 비즈니스 로직 금지
   - 모든 비즈니스 로직은 custom hooks에

4. **UI 일관성**
   - Shadcn/UI 컴포넌트 사용
   - Tailwind CSS 클래스 사용
   - 일본 미니멀리즘 디자인 유지

5. **I18n**
   - 반복되는 일본어 문자열은 `src/lib/constants/ja.ts`에 정의

6. **JSDoc**
   - 복잡한 로직에는 JSDoc 주석 추가

---

## 🚀 기능 요청 후 프로세스

1. **요청 접수** - 위 템플릿으로 기능 요청
2. **구조 설계** - 필요한 파일 구조 확인
3. **타입 정의** - `src/types/index.ts`에 타입 추가
4. **훅 구현** - 비즈니스 로직 작성
5. **UI 구현** - 컴포넌트 작성
6. **통합** - 기존 코드와 연결
7. **테스트** - 린터 체크 & 동작 확인
8. **문서화** - 필요시 README 업데이트

---

## 📚 참고 문서

- `.cursor/rules/honne-dev-standards.mdc` - 개발 규칙
- `DEVELOPMENT_RULES.md` - 개발 규칙 상세 설명
- `DATABASE_SCHEMA_UPDATE.md` - DB 스키마 정보
- `README.md` - 프로젝트 개요

---

## ✨ 기능 요청 시작하기

이제 위 템플릿을 사용하여 원하는 기능을 요청해주세요!

예시:
```markdown
# Feature Request: 게시글 작성

- **Goal:** 사용자가 게시글을 작성할 수 있는 기능
- **Location:** `src/features/post-form` 폴더에 구현해줘.
- **Requirement:**
  - 비즈니스 로직은 `usePostForm.ts` 훅으로 분리할 것.
  - 관련 타입은 `src/types`에 추가할 것.
  - UI는 기존 테마와 일관성을 유지할 것.
```
