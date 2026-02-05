-- ========================================
-- プロフィール画像 & 自己紹介機能 追加
-- ========================================
-- 
-- 実行方法:
-- 1. Supabase Dashboard → SQL Editor
-- 2. New query クリック
-- 3. 下記の内容全体をコピー & 貼り付け
-- 4. Run ボタンをクリック
-- 
-- ========================================

-- ========================================
-- 1. profiles テーブルの作成/更新
-- ========================================

-- profiles テーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  avatar_url TEXT,
  bio TEXT,
  company_name TEXT,
  salary INTEGER,
  has_onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- avatar_url カラム追加 (既存テーブル用)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- bio カラム追加 (既存テーブル用)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

COMMENT ON COLUMN profiles.avatar_url IS 'プロフィール画像URL (Supabase Storage)';
COMMENT ON COLUMN profiles.bio IS '自己紹介文';

-- ========================================
-- 2. profiles テーブルのRLS設定
-- ========================================

-- RLS有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 誰でも閲覧可能
CREATE POLICY IF NOT EXISTS "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- 認証されたユーザーは自分のプロフィールのみ挿入可能
CREATE POLICY IF NOT EXISTS "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 認証されたユーザーは自分のプロフィールのみ更新可能
CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ========================================
-- 3. Storage Bucket 作成 (Dashboard推奨)
-- ========================================
-- 
-- Supabase Dashboard → Storage → Create bucket:
-- - Bucket name: avatars
-- - Public bucket: ✅ (チェック)
-- - File size limit: 2MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp
-- 
-- または下記SQLで作成:
-- 
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 4. Storage RLS ポリシー設定
-- ========================================

-- 全ユーザーがアバター画像を閲覧可能
CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 認証されたユーザーのみアバター画像をアップロード可能
CREATE POLICY IF NOT EXISTS "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ユーザーは自分のアバター画像のみ更新可能
CREATE POLICY IF NOT EXISTS "Users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ユーザーは自分のアバター画像のみ削除可能
CREATE POLICY IF NOT EXISTS "Users can delete own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ========================================
-- 5. 自動タイムスタンプ更新トリガー
-- ========================================

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles テーブルのトリガー
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. 確認
-- ========================================
-- 
-- 1. profiles テーブルに avatar_url, bio カラムが追加されたか確認
-- 2. Storage → Buckets に 'avatars' バケットが作成されたか確認
-- 3. Storage → Policies に RLS ポリシーが適用されたか確認
-- 
-- ========================================

-- ========================================
-- 完了! ✅
-- ========================================
