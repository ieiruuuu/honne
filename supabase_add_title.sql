-- Add title column to posts table
-- 게시글 제목 컬럼 추가

ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT;

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);

-- Update existing posts with default title (optional)
-- 기존 게시글에 기본 제목 설정 (선택사항)
UPDATE posts 
SET title = SUBSTRING(content, 1, 50) || '...'
WHERE title IS NULL AND content IS NOT NULL;

-- Add comment
COMMENT ON COLUMN posts.title IS '게시글 제목';
