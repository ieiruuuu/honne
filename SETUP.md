# 本音 - セットアップガイド

## ✅ 完了した項目

### 1. プロジェクト初期化
- ✅ Next.js 14 (App Router) のインストール
- ✅ TypeScript の設定
- ✅ Tailwind CSS の設定
- ✅ Shadcn/UI コンポーネントのセットアップ

### 2. フォルダ構造
```
src/
├── app/              # ページルーティング
├── components/ui/    # アトミックUIコンポーネント
├── features/posts/   # 投稿機能のコンポーネント
├── lib/             # 共有ライブラリ設定
└── types/           # TypeScript型定義
```

### 3. 作成済みのファイル

#### 型定義 (`src/types/index.ts`)
- `User` インターフェース
- `Post` インターフェース
- `Comment` インターフェース

#### UIコンポーネント
- `Button` - ボタンコンポーネント
- `Card` - カードコンポーネント
- `Badge` - バッジコンポーネント
- `Header` - ヘッダーコンポーネント

#### 機能コンポーネント
- `PostCard` - 投稿カードコンポーネント（悩み、愚痴、質問、雑談）

#### ライブラリ設定
- `lib/utils.ts` - ユーティリティ関数
- `lib/supabase.ts` - Supabase クライアント設定

### 4. ホームページ
- ✅ モバイルファーストのレスポンシブデザイン
- ✅ 日本語ミニマリストUI
- ✅ カテゴリーフィルター（すべて、悩み、愚痴、質問、雑談）
- ✅ 投稿フィード表示
- ✅ モックデータによるプレビュー

## 🔧 次のステップ

### Supabase のセットアップ

1. [Supabase](https://supabase.com) でプロジェクトを作成

2. 環境変数を設定
```bash
cp .env.local.example .env.local
```

3. `.env.local` に認証情報を追加
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. データベーススキーマを作成（SQL Editor で実行）
```sql
-- Posts テーブル
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- '인간관계', '급여', '블랙기업', '커리어', '직장생활' 등
  nickname TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments テーブル
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX posts_category_idx ON posts(category);
CREATE INDEX comments_post_id_idx ON comments(post_id);
```

### 今後の実装予定

1. **認証機能**
   - 匿名ログイン
   - ユーザー登録

2. **投稿機能**
   - 新規投稿作成
   - 投稿編集・削除
   - 画像アップロード

3. **インタラクション**
   - 共感ボタン
   - コメント投稿
   - 通知機能

4. **フィルタリング・検索**
   - カテゴリー別表示
   - キーワード検索
   - ソート機能（新着、人気）

5. **プロフィール**
   - マイページ
   - 投稿履歴
   - 共感した投稿

## 🚀 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 📱 デザインの特徴

- **モバイルファースト**: スマートフォンでの使用を最優先
- **日本語UI**: すべてのラベルとメッセージが日本語
- **ミニマリズム**: シンプルで清潔なデザイン
- **匿名性重視**: ユーザーのプライバシーを保護
- **共感を促す**: サポーティブなコミュニティ文化

## 🎨 カラースキーム

- **悩み**: 青系（落ち着き、信頼）
- **愚痴**: 紫系（感情、解放）
- **質問**: 緑系（成長、希望）
- **雑談**: オレンジ系（明るさ、親しみ）
