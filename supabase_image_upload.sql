-- ========================================
-- 게시글 이미지 업로드 기능 추가
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
-- 1. posts 테이블에 image_url 컬럼 추가
-- ========================================

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN posts.image_url IS '投稿画像のURL (Supabase Storage)';

-- ========================================
-- 2. Storage Bucket 생성 (Dashboard에서 수동 생성 권장)
-- ========================================
-- 
-- Supabase Dashboard → Storage → Create bucket:
-- - Bucket name: post-images
-- - Public bucket: ✅ (체크)
-- - File size limit: 5MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp
-- 
-- 또는 아래 SQL로 생성 (Public bucket):
-- 
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('post-images', 'post-images', true);

-- ========================================
-- 3. Storage RLS 정책 설정
-- ========================================

-- 모든 사용자가 이미지 조회 가능
CREATE POLICY IF NOT EXISTS "Post images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- 인증된 사용자만 이미지 업로드 가능
CREATE POLICY IF NOT EXISTS "Authenticated users can upload post images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-images');

-- 사용자는 자신이 업로드한 이미지만 삭제 가능
CREATE POLICY IF NOT EXISTS "Users can delete own post images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ========================================
-- 4. 확인
-- ========================================
-- 
-- 1. posts 테이블에 image_url 컬럼이 추가되었는지 확인
-- 2. Storage → Buckets에 'post-images' 버킷이 생성되었는지 확인
-- 3. Storage → Policies에 RLS 정책이 적용되었는지 확인
-- 
-- ========================================

-- ========================================
-- 완료! ✅
-- ========================================
