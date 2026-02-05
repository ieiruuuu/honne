-- ========================================
-- Honne 프로젝트 데이터베이스 스키마
-- ========================================
-- 
-- 사용 방법:
-- 1. Supabase Dashboard 접속
-- 2. SQL Editor → New query 클릭
-- 3. 아래 내용 전체 복사 & 붙여넣기
-- 4. Run 버튼 클릭
-- 
-- ========================================

-- ========================================
-- 1. Posts 테이블 (게시글)
-- ========================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  nickname TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts 인덱스 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count DESC);

-- ========================================
-- 2. Post Likes 테이블 (좋아요)
-- ========================================
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Post Likes 인덱스
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- ========================================
-- 3. Comments 테이블 (댓글)
-- ========================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- ========================================
-- 4. Notifications 테이블 (알림)
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ========================================
-- 5. RLS (Row Level Security) 활성화
-- ========================================

-- Posts 테이블 RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Post Likes 테이블 RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Comments 테이블 RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Notifications 테이블 RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 6. Posts 테이블 RLS 정책
-- ========================================

-- 모든 사용자가 게시글 조회 가능
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (true);

-- 로그인한 사용자만 게시글 작성 가능
CREATE POLICY "Authenticated users can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 작성자만 자신의 게시글 수정 가능
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 작성자만 자신의 게시글 삭제 가능
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- 7. Post Likes 테이블 RLS 정책
-- ========================================

-- 모든 사용자가 좋아요 조회 가능
CREATE POLICY "Likes are viewable by everyone"
  ON post_likes FOR SELECT
  USING (true);

-- 로그인한 사용자만 좋아요 추가 가능
CREATE POLICY "Authenticated users can insert likes"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 좋아요만 삭제 가능
CREATE POLICY "Users can delete own likes"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- 8. Comments 테이블 RLS 정책
-- ========================================

-- 모든 사용자가 댓글 조회 가능
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

-- 로그인한 사용자만 댓글 작성 가능
CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 작성자만 자신의 댓글 수정 가능
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 작성자만 자신의 댓글 삭제 가능
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- 9. Notifications 테이블 RLS 정책
-- ========================================

-- 사용자는 자신의 알림만 조회 가능
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 로그인한 사용자는 알림 생성 가능
CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 사용자는 자신의 알림만 수정 가능 (읽음 처리)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 사용자는 자신의 알림만 삭제 가능
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- 10. Realtime 활성화 (선택사항)
-- ========================================

-- Posts 테이블 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- Post Likes 테이블 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;

-- Comments 테이블 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- Notifications 테이블 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ========================================
-- 완료! ✅
-- ========================================
-- 
-- 다음 단계:
-- 1. 이 SQL을 Supabase에서 실행
-- 2. .env.local 파일 업데이트
-- 3. 서버 재시작: rm -rf .next && npm run dev
-- 
-- ========================================
