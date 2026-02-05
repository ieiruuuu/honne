-- ========================================
-- 대댓글 & 댓글 좋아요 기능 추가
-- ========================================
-- 
-- 실행 방법:
-- 1. Supabase Dashboard → SQL Editor
-- 2. New query 클릭
-- 3. 아래 내용 전체 복사 & 붙여넣기
-- 4. Run 버튼 클릭
-- 
-- ========================================

-- ========================================
-- 1. Comments 테이블에 parent_id 추가
-- ========================================

-- parent_id 컬럼 추가 (대댓글용)
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- likes_count 컬럼 추가 (성능 최적화용)
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- parent_id 인덱스 (대댓글 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- likes_count 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_likes_count ON comments(likes_count DESC);

COMMENT ON COLUMN comments.parent_id IS '親コメントのID (null = トップレベルコメント)';
COMMENT ON COLUMN comments.likes_count IS 'コメントのいいね数';

-- ========================================
-- 2. Comment Likes 테이블 생성
-- ========================================

CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Comment Likes 인덱스
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

COMMENT ON TABLE comment_likes IS 'コメントのいいね情報';
COMMENT ON COLUMN comment_likes.comment_id IS 'いいねされたコメントのID';
COMMENT ON COLUMN comment_likes.user_id IS 'いいねしたユーザーのID';

-- ========================================
-- 3. Comment Likes RLS 정책
-- ========================================

-- RLS 활성화
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 댓글 좋아요 조회 가능
CREATE POLICY "Comment likes are viewable by everyone"
  ON comment_likes FOR SELECT
  USING (true);

-- 로그인한 사용자만 좋아요 추가 가능
CREATE POLICY "Authenticated users can insert comment likes"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 좋아요만 삭제 가능
CREATE POLICY "Users can delete own comment likes"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- 4. Comments 테이블 RLS 정책 업데이트 (기존 확인)
-- ========================================

-- 이미 있으면 에러 발생 (무시 가능)
DO $$ 
BEGIN
  -- SELECT 정책
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' 
    AND policyname = 'Comments are viewable by everyone'
  ) THEN
    CREATE POLICY "Comments are viewable by everyone"
      ON comments FOR SELECT
      USING (true);
  END IF;

  -- INSERT 정책
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' 
    AND policyname = 'Authenticated users can insert comments'
  ) THEN
    CREATE POLICY "Authenticated users can insert comments"
      ON comments FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- UPDATE 정책
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' 
    AND policyname = 'Users can update own comments'
  ) THEN
    CREATE POLICY "Users can update own comments"
      ON comments FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- DELETE 정책
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' 
    AND policyname = 'Users can delete own comments'
  ) THEN
    CREATE POLICY "Users can delete own comments"
      ON comments FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ========================================
-- 5. Realtime 활성화
-- ========================================

-- Comment Likes Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE comment_likes;

-- ========================================
-- 6. 함수: 댓글 좋아요 수 업데이트 (Trigger)
-- ========================================

-- 좋아요 수 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE comments
    SET likes_count = likes_count - 1
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger 생성
DROP TRIGGER IF EXISTS update_comment_likes_count_trigger ON comment_likes;
CREATE TRIGGER update_comment_likes_count_trigger
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

-- ========================================
-- 완료! ✅
-- ========================================
-- 
-- 다음 단계:
-- 1. 코드에서 대댓글 UI 구현
-- 2. 댓글 좋아요 훅 구현
-- 3. 테스트
-- 
-- ========================================
