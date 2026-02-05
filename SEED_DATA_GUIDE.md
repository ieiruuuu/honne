# 🌱 Database Stress Test & Seed Data Guide

데이터베이스 시간별 정렬 및 카테고리 필터링 테스트를 위한 시드 데이터 생성 가이드입니다.

---

## 📋 **개요**

### **목적**
- 시간순 정렬 기능 테스트
- 카테고리별 필터링 테스트
- 대량 데이터 렌더링 성능 테스트
- UI/UX 레이아웃 검증

### **특징**
- ✅ 중립적인 샘플 텍스트 사용
- ✅ 테스트 데이터임을 명확히 표시
- ✅ 간편한 정리(Cleanup) 기능
- ✅ 개발 환경 전용

---

## 🛠️ **구현 내용**

### **1. 데이터 생성 로직**

```typescript
// 샘플 텍스트 배열 (중립적)
const SAMPLE_POSTS = [
  "오늘도 야근이다",
  "월급날만 기다림",
  "이직하고 싶다",
  "상사 잔소리 폭발",
  "커피 세 잔째"
];
```

### **2. 시간 분산 로직**

```typescript
function getRandomEveningTimestamp(): string {
  // 오늘 17:00 ~ 23:00 사이 랜덤 시간 생성
  const today = new Date();
  today.setHours(17, 0, 0, 0);
  
  const startTime = today.getTime();
  const endTime = startTime + (6 * 60 * 60 * 1000); // +6시간
  
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime).toISOString();
}
```

### **3. 카테고리별 분산**

```typescript
// 10개 카테고리 × 3개 게시글 = 30개 테스트 데이터
const CATEGORIES = [
  '年収・手取り',
  'ホワイト・ブラック判定',
  'ボーナス報告',
  '転職のホンネ',
  '人間関係・上司',
  '社内政治・派閥',
  'サービス残業・待遇',
  '福利厚生・環境',
  'メンタル・悩み',
  'つぶやき'
];

// 각 카테고리당 3개씩 생성
for (const category of CATEGORIES) {
  for (let i = 0; i < 3; i++) {
    // 게시글 생성
  }
}
```

---

## 🚀 **사용 방법**

### **1. NPM Scripts 추가**

`package.json`에 다음 스크립트를 추가하세요:

```json
{
  "scripts": {
    "seed": "ts-node scripts/seed.ts seed",
    "seed:clean": "ts-node scripts/seed.ts clean",
    "seed:count": "ts-node scripts/seed.ts count"
  }
}
```

### **2. 테스트 데이터 생성**

```bash
# 30개 테스트 게시글 생성
npm run seed
```

**출력 예시:**
```
🌱 Starting database stress test seeding...
✅ Successfully seeded 30 test posts
📊 Distribution: 10 categories × 3 posts each
⏰ Time range: 17:00 - 23:00 (randomized)
```

### **3. 테스트 데이터 개수 확인**

```bash
# 현재 테스트 게시글 개수 확인
npm run seed:count
```

**출력 예시:**
```
📊 Current test posts: 30
```

### **4. 테스트 데이터 삭제**

```bash
# 모든 테스트 게시글 삭제
npm run seed:clean
```

**출력 예시:**
```
🧹 Cleaning up test posts...
✅ Test posts cleaned up successfully
```

---

## 📊 **생성되는 데이터 구조**

### **예시 데이터**

```typescript
{
  content: "오늘도 야근이다",
  category: "サービス残業・待遇",
  nickname: "テストユーザー1",
  created_at: "2026-02-03T19:23:45.123Z", // 17:00~23:00 랜덤
  likes_count: 0
}
```

### **닉네임 패턴**

테스트 데이터는 다음 패턴의 닉네임을 사용합니다:

- `テストユーザー` (테스트 유저)
- `開発社員` (개발 사원)
- `デモ投稿者` (데모 투고자)
- `サンプル参加者` (샘플 참가자)

→ 이 패턴으로 테스트 데이터를 쉽게 식별하고 삭제할 수 있습니다.

---

## 🧪 **테스트 시나리오**

### **1. 시간순 정렬 테스트**

```bash
# 1. 데이터 생성
npm run seed

# 2. 브라우저에서 확인
- 홈 페이지 방문
- 게시글이 최신순으로 정렬되는지 확인
- 17:00~23:00 사이 시간이 랜덤하게 분산되었는지 확인
```

### **2. 카테고리 필터링 테스트**

```bash
# 1. 카테고리별 페이지 방문
- /category/年収・手取り
- /category/転職のホンネ
- 등등...

# 2. 각 카테고리에 3개씩 게시글이 있는지 확인
```

### **3. 스크롤 & 렌더링 성능 테스트**

```bash
# 1. 여러 번 시드 실행 (대량 데이터)
npm run seed  # 첫 번째 30개
npm run seed  # 두 번째 30개
npm run seed  # 세 번째 30개
# 총 90개 데이터

# 2. 스크롤 성능 확인
- 페이지 스크롤이 부드러운지
- 렌더링 속도가 적절한지
```

### **4. 정리 테스트**

```bash
# 테스트 완료 후 데이터 삭제
npm run seed:clean

# 삭제 확인
npm run seed:count
# 출력: Current test posts: 0
```

---

## 🎯 **코드 사용 예시**

### **직접 함수 호출**

```typescript
import { seedTestPosts, cleanupTestPosts, countTestPosts } from '@/lib/seedData';

// 개발 환경에서만 실행
if (process.env.NODE_ENV === 'development') {
  // 데이터 생성
  await seedTestPosts();
  
  // 개수 확인
  const count = await countTestPosts();
  console.log(`Test posts: ${count}`);
  
  // 정리
  await cleanupTestPosts();
}
```

### **React 컴포넌트에서 사용**

```tsx
// 개발용 Admin 페이지
export default function DevAdminPage() {
  const handleSeed = async () => {
    await seedTestPosts();
    alert('30개 테스트 데이터 생성 완료!');
  };
  
  const handleCleanup = async () => {
    await cleanupTestPosts();
    alert('테스트 데이터 삭제 완료!');
  };
  
  return (
    <div>
      <h1>Dev Tools</h1>
      <button onClick={handleSeed}>시드 데이터 생성</button>
      <button onClick={handleCleanup}>데이터 정리</button>
    </div>
  );
}
```

---

## 📈 **데이터 분포**

### **카테고리별 분포**

```
年収・手取り          : 3개
ホワイト・ブラック判定  : 3개
ボーナス報告          : 3개
転職のホンネ          : 3개
人間関係・上司        : 3개
社内政治・派閥        : 3개
サービス残業・待遇    : 3개
福利厚生・環境        : 3개
メンタル・悩み        : 3개
つぶやき             : 3개
─────────────────────────
합계                 : 30개
```

### **시간별 분포 (예시)**

```
17:00-18:00 : ████░ (5개)
18:00-19:00 : ███░░ (4개)
19:00-20:00 : ████░ (6개)
20:00-21:00 : ███░░ (5개)
21:00-22:00 : ████░ (6개)
22:00-23:00 : ███░░ (4개)
```

---

## ⚠️ **주의사항**

### **1. 개발 환경 전용**

```typescript
// 프로덕션에서는 절대 실행하지 마세요!
if (process.env.NODE_ENV === 'production') {
  throw new Error('Seeding is only allowed in development');
}
```

### **2. 정기적인 정리**

```bash
# 테스트 완료 후 반드시 정리하세요
npm run seed:clean
```

### **3. 실제 사용자 데이터와 구분**

```sql
-- 테스트 데이터 확인 쿼리
SELECT * FROM posts 
WHERE nickname LIKE 'テスト%' 
   OR nickname LIKE '開発%'
   OR nickname LIKE 'デモ%'
   OR nickname LIKE 'サンプル%';
```

---

## 🔧 **고급 설정**

### **옵션 1: 테스트 플래그 컬럼 추가**

```sql
-- posts 테이블에 is_test_data 컬럼 추가
ALTER TABLE posts ADD COLUMN is_test_data BOOLEAN DEFAULT FALSE;

-- 테스트 데이터만 조회
SELECT * FROM posts WHERE is_test_data = TRUE;

-- 프로덕션 데이터만 조회
SELECT * FROM posts WHERE is_test_data = FALSE;
```

```typescript
// seedData.ts 수정
const post = {
  content: getRandomItem(SAMPLE_POSTS),
  category: category,
  nickname: generateTestNickname(postIndex),
  created_at: getRandomEveningTimestamp(),
  likes_count: 0,
  is_test_data: true // 플래그 추가
};
```

### **옵션 2: 커스텀 시간 범위**

```typescript
// 특정 날짜/시간 범위로 커스터마이징
function getCustomTimestamp(startHour: number, endHour: number, date?: Date): string {
  const targetDate = date || new Date();
  targetDate.setHours(startHour, 0, 0, 0);
  
  const startTime = targetDate.getTime();
  const endTime = targetDate.getTime() + ((endHour - startHour) * 60 * 60 * 1000);
  
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime).toISOString();
}

// 사용 예시
created_at: getCustomTimestamp(9, 18) // 9:00 ~ 18:00 (근무 시간)
```

### **옵션 3: 커스텀 샘플 텍스트**

```typescript
// 다른 샘플 텍스트로 교체
const CUSTOM_SAMPLES = [
  "Sample Post 1",
  "Test Content 2",
  "Demo Text 3",
  "Placeholder 4",
  "Example 5"
];

// seedData.ts에서 SAMPLE_POSTS 대신 사용
content: getRandomItem(CUSTOM_SAMPLES)
```

---

## 🐛 **트러블슈팅**

### **문제 1: ts-node 없음**

```bash
# ts-node 설치
npm install -D ts-node @types/node

# 또는 tsx 사용
npm install -D tsx
npm run seed  # package.json에서 tsx로 변경
```

### **문제 2: Supabase 연결 실패**

```bash
# .env.local 확인
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# 환경 변수 로드 확인
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
```

### **문제 3: 권한 오류**

```sql
-- Supabase RLS 정책 확인
-- posts 테이블의 INSERT 정책이 활성화되어 있는지 확인

-- 임시로 RLS 비활성화 (개발 중에만!)
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- 테스트 후 다시 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

---

## ✅ **체크리스트**

### **시드 실행 전**
- [ ] 개발 환경인지 확인
- [ ] .env.local 설정 확인
- [ ] Supabase 연결 테스트

### **시드 실행 후**
- [ ] 생성된 데이터 개수 확인 (30개)
- [ ] 카테고리별 분포 확인 (각 3개)
- [ ] 시간 범위 확인 (17:00~23:00)
- [ ] UI에서 정상 표시 확인

### **테스트 완료 후**
- [ ] 테스트 데이터 삭제
- [ ] 삭제 확인 (count = 0)
- [ ] 실제 사용자 데이터 영향 없음 확인

---

## 🎉 **요약**

```bash
# 빠른 시작
npm install -D ts-node @types/node  # 의존성 설치
npm run seed                        # 데이터 생성
# 브라우저에서 테스트...
npm run seed:clean                  # 데이터 정리
```

**완료!** 🎊

이제 시간별 정렬과 카테고리 필터링을 안전하게 테스트할 수 있습니다!
