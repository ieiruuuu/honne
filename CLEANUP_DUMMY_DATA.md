# 🗑️ 더미 데이터 삭제 및 실제 데이터 전환 가이드

## ✅ 완료된 작업

### 1. 코드 정리 완료
```
✅ usePosts.ts - 모크 데이터 제거
✅ usePost.ts - 모크 데이터 제거
✅ useMyPosts.ts - 모크 데이터 제거
✅ useSearch.ts - 모크 데이터 제거
✅ FeedList.tsx - Empty State UI 추가
```

### 2. Empty State UI 구현
```
✨ 중앙 정렬 레이아웃
✨ 아이콘 (PenSquare)
✨ 타이틀: "まだ投稿がありません"
✨ 서브타이틀: "最初の本音を聞かせてください！"
✨ CTA 버튼: "今すぐ投稿する"
✨ 추가 설명: "匿名で安心して本音を共有できます"
```

---

## 📊 데이터베이스 정리

### 방법 1: Supabase Dashboard에서 삭제 (권장)

#### 1.1. Supabase Dashboard 접속
```
https://supabase.com/dashboard
→ 프로젝트 선택
→ "Table Editor" 메뉴
```

#### 1.2. `posts` 테이블 삭제
```
1. 좌측 메뉴에서 "posts" 테이블 클릭
2. 삭제할 행(row) 선택
   - 특정 ID 범위 선택
   - 또는 전체 선택 (Shift + Click)
3. 상단의 "Delete" 버튼 클릭
4. 확인 대화상자에서 "Delete" 클릭
```

#### 1.3. 관련 테이블도 정리 (선택사항)
```
- post_likes 테이블 (좋아요 데이터)
- comments 테이블 (댓글 데이터)
- notifications 테이블 (알림 데이터)
```

---

### 방법 2: SQL Editor로 삭제

#### 2.1. SQL Editor 접속
```
Supabase Dashboard
→ "SQL Editor" 메뉴
→ "New query" 버튼
```

#### 2.2. 전체 데이터 삭제

##### posts 테이블 전체 삭제
```sql
-- ⚠️ 주의: posts 테이블의 모든 데이터 삭제
DELETE FROM posts;
```

##### 관련 테이블도 전체 삭제 (선택사항)
```sql
-- 좋아요 데이터 삭제
DELETE FROM post_likes;

-- 댓글 데이터 삭제
DELETE FROM comments;

-- 알림 데이터 삭제
DELETE FROM notifications;
```

##### 모든 테이블 한번에 정리 (완전 리셋)
```sql
-- ⚠️ 위험: 모든 게시 관련 데이터 삭제
BEGIN;

DELETE FROM notifications;
DELETE FROM comments;
DELETE FROM post_likes;
DELETE FROM posts;

COMMIT;
```

---

#### 2.3. 특정 ID 범위만 삭제

##### ID가 1~10인 더미 데이터만 삭제
```sql
-- ID 1~10번만 삭제
DELETE FROM posts 
WHERE id IN ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
```

##### 특정 닉네임의 데이터만 삭제
```sql
-- 더미 닉네임 데이터 삭제
DELETE FROM posts 
WHERE nickname IN ('匿名太郎', 'サラリーマン', '疲れた社員', '悩める社員', '転職成功者');
```

##### 특정 날짜 이전 데이터만 삭제
```sql
-- 2026-02-01 이전 데이터 삭제
DELETE FROM posts 
WHERE created_at < '2026-02-01 00:00:00';
```

---

#### 2.4. 관련 데이터도 함께 삭제 (Cascade)

##### 특정 게시물과 관련된 모든 데이터 삭제
```sql
-- posts 테이블의 특정 ID 삭제 시, 
-- 관련 comments, post_likes, notifications도 자동 삭제되도록 설정

-- 1. 먼저 관련 데이터 삭제
DELETE FROM notifications WHERE post_id IN ('1', '2', '3', '4', '5');
DELETE FROM comments WHERE post_id IN ('1', '2', '3', '4', '5');
DELETE FROM post_likes WHERE post_id IN ('1', '2', '3', '4', '5');

-- 2. 그 다음 게시물 삭제
DELETE FROM posts WHERE id IN ('1', '2', '3', '4', '5');
```

---

### 방법 3: API를 통한 삭제 (프로그래밍 방식)

#### 3.1. Node.js 스크립트 작성

`scripts/clean-dummy-data.js` 파일 생성:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_SERVICE_ROLE_KEY' // ⚠️ Service Role Key 사용
);

async function cleanDummyData() {
  try {
    console.log('🗑️ Deleting dummy data...');

    // 1. 더미 닉네임 목록
    const dummyNicknames = [
      '匿名太郎',
      'サラリーマン',
      '疲れた社員',
      '悩める社員',
      '転職成功者',
      '匿名のエンジニア',
      '匿名の会社員',
      '嬉しい社員'
    ];

    // 2. 더미 게시물 삭제
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id')
      .in('nickname', dummyNicknames);

    if (fetchError) throw fetchError;

    console.log(`Found ${posts.length} dummy posts`);

    if (posts.length > 0) {
      const postIds = posts.map(p => p.id);

      // 3. 관련 데이터 삭제
      await supabase.from('notifications').delete().in('post_id', postIds);
      await supabase.from('comments').delete().in('post_id', postIds);
      await supabase.from('post_likes').delete().in('post_id', postIds);
      
      // 4. 게시물 삭제
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .in('id', postIds);

      if (deleteError) throw deleteError;

      console.log('✅ Dummy data deleted successfully!');
    } else {
      console.log('✅ No dummy data found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

cleanDummyData();
```

#### 3.2. 스크립트 실행
```bash
node scripts/clean-dummy-data.js
```

---

## 🔐 안전한 삭제 절차

### 1단계: 백업 생성 (권장)

```sql
-- 백업 테이블 생성
CREATE TABLE posts_backup AS 
SELECT * FROM posts;

CREATE TABLE comments_backup AS 
SELECT * FROM comments;

CREATE TABLE post_likes_backup AS 
SELECT * FROM post_likes;
```

### 2단계: 데이터 확인

```sql
-- 삭제 전 데이터 확인
SELECT id, content, nickname, created_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 20;
```

### 3단계: 조건부 삭제 실행

```sql
-- 더미 데이터만 삭제 (안전)
DELETE FROM posts 
WHERE nickname IN ('匿名太郎', 'サラリーマン', '疲れた社員');
```

### 4단계: 결과 확인

```sql
-- 삭제 후 남은 데이터 확인
SELECT COUNT(*) as total_posts FROM posts;

-- 실제 유저 데이터만 남았는지 확인
SELECT DISTINCT nickname FROM posts;
```

---

## 📋 삭제 체크리스트

### 삭제 전
```
□ Supabase Dashboard 로그인 확인
□ 백업 생성 (선택사항)
□ 삭제할 데이터 범위 확인
□ SQL 쿼리 테스트 (SELECT로 먼저 확인)
```

### 삭제 중
```
□ posts 테이블 데이터 삭제
□ post_likes 테이블 정리
□ comments 테이블 정리
□ notifications 테이블 정리
```

### 삭제 후
```
□ 데이터 삭제 확인
□ 애플리케이션 테스트
□ Empty State UI 확인
□ 새 게시물 작성 테스트
```

---

## 🧪 애플리케이션 테스트

### 1. 로컬 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
open http://localhost:3000
```

### 2. 확인 사항

#### Empty State 확인
```
✅ 메인 피드가 비어있음
✅ "まだ投稿がありません" 표시
✅ "最初の本音を聞かせてください！" 표시
✅ "今すぐ投稿する" 버튼 표시
✅ 버튼 클릭 시 /write 페이지 이동
```

#### 새 게시물 작성 테스트
```
✅ /write 페이지 접속
✅ 카테고리 선택
✅ 내용 입력
✅ 투고する 버튼 클릭
✅ 메인 피드에 새 게시물 표시
✅ Empty State 사라짐
```

#### 카테고리 페이지 확인
```
✅ /categories 페이지 접속
✅ 각 카테고리 클릭
✅ Empty State 표시 (데이터 없을 때)
```

---

## 🚀 프로덕션 배포

### 1. 프로덕션 데이터베이스 정리

```
⚠️ 주의: 프로덕션 환경에서는 더욱 신중하게!

1. Vercel 환경의 Supabase URL 확인
2. 프로덕션 Supabase Dashboard 접속
3. 위의 SQL 쿼리 실행
4. 데이터 삭제 확인
```

### 2. 배포 후 확인

```bash
# 로컬 커밋
git add .
git commit -m "feat: Remove dummy data and add empty state UI"

# GitHub 푸시
git push origin main

# Vercel 자동 배포 대기
```

### 3. 프로덕션 테스트

```
✅ Production URL 접속
✅ Empty State 확인
✅ 새 게시물 작성 테스트
✅ 실시간 업데이트 확인
✅ 좋아요 기능 테스트
✅ 댓글 기능 테스트
```

---

## 📊 데이터 구조 참고

### posts 테이블 구조
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  nickname TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 더미 데이터 예시 (삭제 대상)
```
ID: 1-10
Nicknames: 匿名太郎, サラリーマン, 疲れた社員, 悩める社員, 転職成功者
Created: 2026-02-01 이전
```

---

## 💡 유용한 SQL 쿼리

### 데이터 통계 확인
```sql
-- 전체 게시물 수
SELECT COUNT(*) FROM posts;

-- 카테고리별 게시물 수
SELECT category, COUNT(*) 
FROM posts 
GROUP BY category 
ORDER BY COUNT(*) DESC;

-- 닉네임별 게시물 수
SELECT nickname, COUNT(*) 
FROM posts 
GROUP BY nickname 
ORDER BY COUNT(*) DESC;

-- 최근 게시물 10개
SELECT id, LEFT(content, 50) as preview, nickname, created_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 10;
```

### 데이터 품질 확인
```sql
-- NULL 값 체크
SELECT COUNT(*) FROM posts WHERE content IS NULL;
SELECT COUNT(*) FROM posts WHERE category IS NULL;
SELECT COUNT(*) FROM posts WHERE nickname IS NULL;

-- 빈 문자열 체크
SELECT COUNT(*) FROM posts WHERE content = '';
SELECT COUNT(*) FROM posts WHERE nickname = '';
```

---

## 🔧 문제 해결

### 문제 1: 삭제 권한 오류
```
Error: permission denied for table posts
```

**해결:**
```
1. Supabase Dashboard → Authentication → Policies
2. posts 테이블의 DELETE policy 확인
3. Service Role Key 사용 (admin 권한)
```

### 문제 2: 외래 키 제약 오류
```
Error: update or delete on table "posts" violates foreign key constraint
```

**해결:**
```sql
-- 관련 데이터를 먼저 삭제
DELETE FROM notifications WHERE post_id = 'target_id';
DELETE FROM comments WHERE post_id = 'target_id';
DELETE FROM post_likes WHERE post_id = 'target_id';
DELETE FROM posts WHERE id = 'target_id';
```

### 문제 3: Empty State가 표시되지 않음
```
데이터를 삭제했는데도 여전히 게시물이 보임
```

**해결:**
```bash
# 1. 브라우저 캐시 삭제
# 2. Hard Refresh (Cmd + Shift + R)
# 3. 개발 서버 재시작
npm run dev
```

---

## ✅ 완료 확인

### 코드 정리
```
✅ usePosts.ts - 모크 데이터 제거 완료
✅ usePost.ts - 모크 데이터 제거 완료
✅ useMyPosts.ts - 모크 데이터 제거 완료
✅ useSearch.ts - 모크 데이터 제거 완료
✅ FeedList.tsx - Empty State UI 추가 완료
```

### 데이터베이스 정리
```
⏳ Supabase Dashboard 접속
⏳ posts 테이블 데이터 삭제
⏳ 관련 테이블 정리 (선택)
⏳ 삭제 결과 확인
```

### 테스트
```
⏳ Empty State UI 확인
⏳ 새 게시물 작성
⏳ 실시간 업데이트 테스트
⏳ 프로덕션 배포 및 테스트
```

---

## 🎯 요약

### 변경 사항
1. **코드에서 모든 더미 데이터 제거**
2. **Empty State UI 구현** (일본어 메시지)
3. **Supabase 실제 데이터만 표시**

### 다음 단계
1. **Supabase Dashboard에서 더미 데이터 삭제**
2. **애플리케이션 테스트**
3. **프로덕션 배포**

### SQL 명령어 (빠른 삭제)
```sql
-- 전체 삭제 (⚠️ 주의)
DELETE FROM posts;

-- 또는 특정 닉네임만 삭제
DELETE FROM posts 
WHERE nickname IN ('匿名太郎', 'サラリーマン', '疲れた社員', '悩める社員', '転職成功者');
```

---

**이제 실제 유저 데이터만 보여주는 깔끔한 애플리케이션이 되었습니다!** ✨
