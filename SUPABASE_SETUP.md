# Supabase 설정 가이드

## 🎯 개요

본음(本音) 프로젝트에서 Supabase를 설정하고 실시간 게시글 기능을 활성화하는 방법입니다.

---

## 📋 1단계: Supabase 프로젝트 생성

### 1.1 Supabase 가입 및 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속
2. "Start your project" 클릭
3. GitHub/Google 계정으로 로그인
4. "New Project" 클릭
5. 프로젝트 정보 입력:
   - **Name**: honne (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (저장 필수!)
   - **Region**: Northeast Asia (Seoul) 선택 (가장 가까운 지역)
6. "Create new project" 클릭 (1-2분 소요)

### 1.2 API Keys 확인

프로젝트가 생성되면:
1. 좌측 메뉴에서 **Settings** (⚙️) 클릭
2. **API** 섹션 클릭
3. 다음 정보 복사:
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** key (공개 키)

---

## 🗃️ 2단계: 데이터베이스 테이블 생성

### 2.1 SQL Editor 열기

1. 좌측 메뉴에서 **SQL Editor** 클릭
2. "New query" 클릭

### 2.2 테이블 생성 SQL 실행

다음 SQL을 복사하여 실행:

```sql
-- Posts 테이블 생성
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  nickname TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments 테이블 생성
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX posts_category_idx ON posts(category);
CREATE INDEX comments_post_id_idx ON comments(post_id);
```

3. **Run** 버튼 클릭하여 실행
4. 성공 메시지 확인: `Success. No rows returned`

### 2.3 테이블 확인

1. 좌측 메뉴에서 **Table Editor** 클릭
2. `posts` 테이블이 보이는지 확인
3. `comments` 테이블이 보이는지 확인

---

## 🔐 3단계: 환경 변수 설정

### 3.1 .env.local 파일 생성

프로젝트 루트에서:

```bash
cp .env.local.example .env.local
```

### 3.2 환경 변수 입력

`.env.local` 파일을 열고 다음 값을 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

**중요**: 
- `your-project-id`를 실제 프로젝트 URL로 교체
- `your-anon-public-key`를 실제 anon public key로 교체

---

## 🔴 4단계: Realtime 활성화

### 4.1 Realtime 설정

1. 좌측 메뉴에서 **Database** 클릭
2. **Replication** 탭 클릭
3. `posts` 테이블 찾기
4. **Enable** 토글 클릭 (파란색으로 변경)
5. 모든 이벤트 체크:
   - ✅ INSERT
   - ✅ UPDATE
   - ✅ DELETE

### 4.2 설정 저장

"Save" 버튼 클릭

---

## 🧪 5단계: 테스트

### 5.1 개발 서버 시작

```bash
npm run dev
```

### 5.2 브라우저에서 확인

1. http://localhost:3000 접속
2. 게시글 작성 폼이 보이는지 확인
3. 테스트 게시글 작성:
   - 내容: 테스트 투고입니다
   - ニックネーム: テストユーザー
   - カテゴリー: 인간관계
4. "投稿する" 버튼 클릭
5. 게시글이 즉시 피드에 나타나는지 확인

### 5.3 Realtime 테스트

1. 브라우저를 2개 탭으로 열기
2. 한 탭에서 게시글 작성
3. 다른 탭에서 자동으로 새 게시글이 나타나는지 확인

---

## 🎨 6단계: 샘플 데이터 추가 (선택사항)

테스트를 위해 샘플 데이터를 추가하려면:

```sql
-- SQL Editor에서 실행
INSERT INTO posts (content, category, nickname, likes_count) VALUES
  ('上司との関係に悩んでいます。毎日のように小さなことで怒られて、精神的に辛いです。転職を考えるべきでしょうか...', '인간관계', '匿名太郎', 24),
  ('今年の昇給、たったの3000円でした...物価上昇を考えると実質減給ですよね。みなさんはどうですか？', '급여', 'サラリーマン', 42),
  ('残業代が出ない、休憩時間がない、パワハラ当たり前...これって完全にブラックですよね？', '블랙기업', '疲れた社員', 65),
  ('30代でキャリアチェンジを考えています。未経験の業界に挑戦するのは無謀でしょうか？', '커리어', '転職希望', 18);
```

---

## 🔍 트러블슈팅

### 문제 1: "Failed to fetch posts" 에러

**원인**: 환경 변수가 올바르게 설정되지 않음

**해결**:
1. `.env.local` 파일 확인
2. URL과 API Key가 정확한지 확인
3. 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

### 문제 2: 게시글이 실시간으로 업데이트되지 않음

**원인**: Realtime이 활성화되지 않음

**해결**:
1. Supabase Dashboard → Database → Replication
2. `posts` 테이블의 Realtime이 활성화되어 있는지 확인
3. 모든 이벤트(INSERT, UPDATE, DELETE)가 체크되어 있는지 확인

### 문제 3: "relation 'posts' does not exist" 에러

**원인**: 테이블이 생성되지 않음

**해결**:
1. SQL Editor에서 테이블 생성 SQL 다시 실행
2. Table Editor에서 테이블 존재 확인

### 문제 4: Row Level Security (RLS) 에러

**원인**: RLS가 활성화되어 있지만 정책이 없음

**해결**:
```sql
-- 모든 사용자가 읽기/쓰기 가능하도록 설정 (익명 커뮤니티이므로)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON posts
  FOR UPDATE USING (true);
```

---

## 📊 데이터 확인

### Table Editor에서 확인

1. **Table Editor** → **posts** 선택
2. 게시글 목록 확인
3. 필요시 수정/삭제 가능

### SQL Editor에서 조회

```sql
-- 모든 게시글 확인
SELECT * FROM posts ORDER BY created_at DESC;

-- 카테고리별 게시글 수
SELECT category, COUNT(*) as count 
FROM posts 
GROUP BY category;

-- 최근 24시간 게시글
SELECT * FROM posts 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## 🎯 다음 단계

Supabase 설정이 완료되었습니다! 이제 다음 기능을 구현할 수 있습니다:

- [ ] 좋아요 기능 추가
- [ ] 댓글 기능 구현
- [ ] 카테고리 필터링
- [ ] 검색 기능
- [ ] 이미지 업로드 (Supabase Storage)

---

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
