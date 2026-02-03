# 🚀 本音 (Honne) - Vercel デプロイガイド

## 📋 デプロイ前チェックリスト

- ✅ Git コミット完了 (commit: `f9d2ff5`)
- ✅ ビルド成功確認 (`npm run build` ✓)
- ✅ ローカル動作確認 (`http://localhost:3000` ✓)
- ✅ `.gitignore` 設定 (環境変数保護 ✓)
- ✅ `.env.example` 作成 (デプロイ後設定用 ✓)

---

## 🌐 方法 1: Vercel Web Dashboard (推奨 - 最も簡単)

### ステップ 1: GitHub にプッシュ (オプション)

```bash
# GitHub リポジトリを作成してから実行
git remote add origin https://github.com/your-username/honne.git
git push -u origin main
```

### ステップ 2: Vercel にデプロイ

1. **Vercel にアクセス**: https://vercel.com
2. **ログイン**: GitHub / GitLab / Bitbucket アカウントで
3. **"Add New Project"** クリック
4. **リポジトリをインポート**:
   - GitHub からインポート (推奨)
   - または Git リポジトリ URL を直接入力
5. **プロジェクト設定**:
   ```
   Project Name: honne
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```
6. **環境変数設定** (後で設定可能):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
   ```
7. **"Deploy"** クリック

### ステップ 3: デプロイ完了 🎉

- デプロイ URL: `https://honne-xxxxx.vercel.app`
- カスタムドメイン設定可能
- 自動 HTTPS 証明書
- 世界中の CDN で高速配信

---

## ⚡ 方法 2: Vercel CLI (高速)

### インストール & ログイン

```bash
# Vercel CLI をインストール (npx 使用、インストール不要)
npx vercel login

# プロジェクトフォルダで実行
cd /Users/yalekim/Desktop/honne
npx vercel
```

### 初回デプロイ設定

```bash
? Set up and deploy "~/Desktop/honne"? [Y/n] Y
? Which scope do you want to deploy to? [あなたのアカウント]
? Link to existing project? [Y/n] n
? What's your project's name? honne
? In which directory is your code located? ./
? Want to modify these settings? [y/N] N
```

### 本番デプロイ

```bash
npx vercel --prod
```

**結果**:
```
✅ Production: https://honne-xxxxx.vercel.app [コピー]
```

---

## 🔧 デプロイ後の設定

### 1. Supabase 環境変数 (必要な場合)

**Vercel Dashboard → Project → Settings → Environment Variables**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
```

**追加後**: **Redeploy** ボタンをクリック

### 2. カスタムドメイン設定 (オプション)

**Vercel Dashboard → Project → Settings → Domains**

```
honne.jp  →  CNAME: cname.vercel-dns.com
```

DNS 設定後、自動的に HTTPS 証明書が発行されます。

### 3. 分析・モニタリング (無料)

**Vercel Dashboard → Project → Analytics**

- リアルタイムトラフィック
- パフォーマンスメトリクス
- エラートラッキング

---

## 📊 デプロイされる内容

### ページ (全 11 ページ)

| Route | Type | Size | Description |
|-------|------|------|-------------|
| `/` | Static | 157 kB | ホーム (フィード) |
| `/write` | Static | 155 kB | 投稿作成 |
| `/search` | Static | 157 kB | 検索 |
| `/notifications` | Static | 154 kB | 通知一覧 |
| `/mypage` | Static | 163 kB | マイページ |
| `/post/[id]` | Dynamic | 155 kB | 投稿詳細 |
| `/settings` | Static | 154 kB | 設定 |
| `/settings/profile` | Static | 154 kB | プロフィール設定 |

### 機能

- ✅ ソーシャルログイン (LINE, X, Apple, Email)
- ✅ 匿名ニックネームシステム
- ✅ 投稿作成・閲覧
- ✅ リアルタイム検索
- ✅ 通知システム
- ✅ カテゴリーフィルター (10カテゴリー)
- ✅ レスポンシブデザイン (モバイルファースト)

---

## 🔍 デプロイ後の確認

### 1. デプロイ成功確認

```bash
curl -I https://your-app.vercel.app
# HTTP/2 200 が返ってくればOK
```

### 2. ページアクセステスト

- [ ] ホームページ: https://your-app.vercel.app
- [ ] マイページ: https://your-app.vercel.app/mypage
- [ ] 検索: https://your-app.vercel.app/search
- [ ] 投稿作成: https://your-app.vercel.app/write

### 3. 認証テスト

1. マイページにアクセス
2. "ログインする" ボタンクリック
3. モックログイン動作確認 ✅
4. (Supabase 設定後) 実際のソーシャルログイン ✅

---

## 🚨 トラブルシューティング

### エラー: "Module not found"

**原因**: パッケージインストール失敗

**解決**:
```bash
# ローカルで確認
npm install
npm run build

# 問題なければ Vercel で Redeploy
```

### エラー: "Environment variable not set"

**原因**: Supabase 環境変数未設定

**解決**:
- アプリは **モックモード** で動作します (実害なし)
- Supabase を使う場合は、環境変数を設定して Redeploy

### エラー: "Build timeout"

**原因**: ビルド時間が長すぎる

**解決**:
- Vercel の無料プランは 45 秒制限
- Pro プラン ($20/月) は制限なし
- 通常は問題なし (現在のビルド時間: ~6 秒)

### ページが表示されない

**原因**: ルーティング設定ミス

**解決**:
```bash
# next.config.mjs を確認
# 現在は問題なし (空設定で正常動作)
```

---

## 📈 パフォーマンス最適化 (デプロイ後)

### 1. 画像最適化 (Next.js Image)

```tsx
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="本音" 
  width={100} 
  height={100}
/>
```

### 2. フォント最適化 (既に実装済み)

```tsx
// src/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
```

### 3. コード分割 (自動)

- Next.js が自動的にページごとに分割
- 初回ロード時間を最小化

### 4. CDN キャッシング (自動)

- Vercel が自動的に CDN に配信
- 世界中で高速アクセス

---

## 🔐 セキュリティ推奨事項

### 1. 環境変数の保護

- ✅ `.env.local` は `.gitignore` に含まれている
- ✅ Vercel ダッシュボードでのみ設定
- ⚠️ **絶対に Git にコミットしないこと**

### 2. Supabase RLS (Row Level Security)

```sql
-- posts テーブルの RLS 設定例
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

### 3. CORS 設定 (Supabase)

**Supabase Dashboard → Settings → API**

```
Allowed Origins:
https://your-app.vercel.app
```

---

## 🎯 次のステップ

### 1. カスタムドメイン設定

```
本音.jp → Vercel プロジェクトに接続
```

### 2. Supabase 本番環境設定

- [ ] Supabase プロジェクト作成
- [ ] Auth Providers 有効化 (LINE, X, Apple, Email)
- [ ] Database スキーマ適用
- [ ] 環境変数を Vercel に設定

### 3. 分析ツール統合

- Google Analytics
- Vercel Analytics (無料)
- Sentry (エラートラッキング)

### 4. SEO 最適化

```tsx
// src/app/layout.tsx
export const metadata = {
  title: '本音 - 職場の本音を共有するコミュニティ',
  description: '匿名で職場の悩みや本音を共有できる日本の会社員向けプラットフォーム',
  keywords: ['職場', '本音', '匿名', '会社員', '転職'],
  openGraph: {
    title: '本音',
    description: '職場の本音を共有',
    url: 'https://your-app.vercel.app',
    siteName: '本音',
    locale: 'ja_JP',
    type: 'website',
  },
};
```

---

## 📞 サポート

### Vercel サポート

- ドキュメント: https://vercel.com/docs
- コミュニティ: https://github.com/vercel/vercel/discussions
- メール: support@vercel.com (Pro プラン以上)

### Next.js サポート

- ドキュメント: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js

---

## 🎉 デプロイ完了！

**あなたのアプリは世界中からアクセス可能になりました！**

```
🌐 Production URL: https://honne-xxxxx.vercel.app
📱 モバイル対応: ✓
🔒 HTTPS: ✓
⚡ CDN: ✓
🇯🇵 日本語UI: ✓
```

**共有して、日本の会社員コミュニティを育てましょう！** 🚀

---

## 📝 クイックコマンド一覧

```bash
# ローカル開発
npm run dev          # http://localhost:3000

# ビルドテスト
npm run build        # プロダクションビルド
npm start            # プロダクションサーバー起動

# デプロイ
npx vercel          # プレビューデプロイ
npx vercel --prod   # 本番デプロイ

# Git操作
git add .
git commit -m "Update: feature description"
git push            # GitHub 連携時、自動デプロイ
```

---

**Happy Deployment! 🎊**
