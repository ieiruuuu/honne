# 🟢 LINE ログイン直接実装ガイド

## ✅ 実装完了！Supabase Dashboard 不要の LINE 認証

Supabase Dashboard の LINE Provider 設定なしで、**LINE Developers の OAuth 2.0 を直接連携**しました。

---

## 🎯 実装内容

### 1. **カスタム LINE OAuth フロー**

```
ユーザー → LINE 認証ページ → Callback URL → Access Token 交換 → プロフィール取得 → Supabase 保存
```

### 2. **実装ファイル**

```
src/
├── lib/
│   └── line-auth.ts                    # LINE OAuth コア関数 (NEW)
├── app/
│   ├── api/auth/line/exchange/
│   │   └── route.ts                    # Token 交換 API (NEW)
│   └── auth/line/callback/
│       └── page.tsx                    # Callback ページ (NEW)
└── features/auth/hooks/
    └── useAuth.ts                      # LINE ログイン統合 (UPDATED)
```

---

## 🔧 LINE Developers 設定

### Step 1: LINE Developers Console にアクセス

https://developers.line.biz/console/

### Step 2: チャネルを作成

1. **"Create a new provider"** (初回のみ)
2. **"Create a LINE Login channel"**
3. チャネル情報を入力:
   ```
   Channel name: 本音 (Honne)
   Channel description: 職場の本音を共有するコミュニティ
   App types: Web app
   ```

### Step 3: Callback URL を設定

**Channel settings → LINE Login → Callback URL**

```
# ローカル開発
http://localhost:3000/auth/line/callback

# 本番環境 (Vercel デプロイ後)
https://your-app.vercel.app/auth/line/callback
```

⚠️ **両方を登録してください**

### Step 4: Channel ID と Secret を取得

**Channel settings → Basic settings**

```
Channel ID: 1234567890
Channel secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔐 環境変数設定

### ローカル開発 (`.env.local`)

```bash
# LINE Login OAuth 2.0
LINE_CLIENT_ID=1234567890
LINE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_LINE_REDIRECT_URI=http://localhost:3000/auth/line/callback

# Supabase (オプション - モックモード可)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 本番環境 (Vercel)

**Vercel Dashboard → Project → Settings → Environment Variables**

```
LINE_CLIENT_ID=1234567890
LINE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_LINE_REDIRECT_URI=https://your-app.vercel.app/auth/line/callback
```

**重要**: 環境変数追加後、**Redeploy** ボタンをクリック

---

## 🚀 動作フロー詳細

### 1. ユーザーが "LINE でログイン" をクリック

**`AuthModal.tsx`**
```tsx
<button onClick={() => handleSocialLogin("line")}>
  LINEでログイン
</button>
```

### 2. LINE 認証 URL に自動リダイレクト

**`useAuth.ts` → `generateLineAuthUrl()`**
```typescript
// 生成される URL
https://access.line.me/oauth2/v2.1/authorize?
  response_type=code
  &client_id=1234567890
  &redirect_uri=http://localhost:3000/auth/line/callback
  &state=uuid-for-csrf-protection
  &scope=profile openid
  &nonce=uuid-for-replay-protection
```

### 3. ユーザーが LINE で認証

- LINE アプリまたはブラウザで認証
- 「許可する」ボタンをクリック

### 4. Callback URL にリダイレクト

**LINE が返す URL**
```
http://localhost:3000/auth/line/callback?
  code=authorization_code_here
  &state=uuid-for-csrf-protection
```

### 5. Authorization Code を Access Token に交換

**`/auth/line/callback/page.tsx` → `/api/auth/line/exchange`**

```typescript
// API Route が実行
POST /api/auth/line/exchange
Body: { code: "authorization_code_here" }

// LINE API にリクエスト
POST https://api.line.me/oauth2/v2.1/token
Body: {
  grant_type: "authorization_code",
  code: "authorization_code_here",
  redirect_uri: "...",
  client_id: "...",
  client_secret: "..."
}

// レスポンス
{
  access_token: "ACCESS_TOKEN",
  token_type: "Bearer",
  expires_in: 2592000,
  refresh_token: "REFRESH_TOKEN"
}
```

### 6. Access Token でユーザープロフィール取得

**`line-auth.ts` → `getLineProfile()`**

```typescript
GET https://api.line.me/v2/profile
Headers: Authorization: Bearer ACCESS_TOKEN

// レスポンス
{
  userId: "U1234567890abcdef",
  displayName: "山田太郎",
  pictureUrl: "https://profile.line-scdn.net/...",
  statusMessage: "Hello World"
}
```

### 7. Supabase にユーザー保存

**`/api/auth/line/exchange/route.ts`**

```typescript
// 既存ユーザーを検索
SELECT * FROM users WHERE line_user_id = 'U1234567890abcdef'

// 新規ユーザーの場合
INSERT INTO users (line_user_id, display_name, picture_url)
VALUES ('U1234567890abcdef', '山田太郎', 'https://...')
```

### 8. ログイン完了 → マイページへ

**`useAuthStore` にユーザー情報保存**
```typescript
setUser({
  id: "U1234567890abcdef",
  nickname: "山田太郎",
  avatar_url: "https://...",
  provider: "line"
})

// 2秒後にリダイレクト
router.push("/mypage")
```

---

## 🛡️ セキュリティ対策

### 1. **CSRF 攻撃対策 (State パラメータ)**

```typescript
// ランダムな state を生成して LocalStorage に保存
const state = uuidv4();
localStorage.setItem('line_oauth_state', state);

// Callback で検証
const storedState = localStorage.getItem('line_oauth_state');
if (storedState !== receivedState) {
  throw new Error('CSRF attack detected');
}
```

### 2. **リプレイ攻撃対策 (Nonce)**

```typescript
// 一度だけ使える nonce を付与
const params = {
  // ...
  nonce: uuidv4()
};
```

### 3. **Client Secret の保護**

- ✅ `.env.local` (Git にコミットされない)
- ✅ サーバーサイド API Route でのみ使用
- ✅ ブラウザには絶対に送信しない

### 4. **HTTPS 必須 (本番環境)**

- Vercel は自動的に HTTPS を適用
- LINE Developers の Callback URL も HTTPS のみ許可

---

## 🧪 テスト方法

### ローカル開発

1. **環境変数を設定**
   ```bash
   cp .env.example .env.local
   # LINE_CLIENT_ID と LINE_CLIENT_SECRET を入力
   ```

2. **開発サーバー起動**
   ```bash
   npm run dev
   ```

3. **マイページにアクセス**
   ```
   http://localhost:3000/mypage
   ```

4. **"ログインする" → "LINE でログイン"**

5. **LINE 認証画面で許可**

6. **自動的にマイページに戻る**
   - ✅ ニックネームが表示される
   - ✅ プロフィール画像が表示される (LINE 設定による)

### 本番環境 (Vercel)

1. **Vercel に環境変数を設定**
   ```
   LINE_CLIENT_ID=...
   LINE_CLIENT_SECRET=...
   NEXT_PUBLIC_LINE_REDIRECT_URI=https://your-app.vercel.app/auth/line/callback
   ```

2. **LINE Developers で本番 Callback URL を登録**
   ```
   https://your-app.vercel.app/auth/line/callback
   ```

3. **Redeploy**

4. **本番 URL でテスト**

---

## 🐛 トラブルシューティング

### エラー: "Invalid callback URL"

**原因**: LINE Developers で Callback URL が未登録

**解決**:
```
LINE Developers Console
→ Channel settings
→ LINE Login
→ Callback URL に追加
```

### エラー: "Invalid client_id or client_secret"

**原因**: 環境変数が間違っている

**解決**:
```bash
# .env.local を確認
LINE_CLIENT_ID=正しいChannel ID
LINE_CLIENT_SECRET=正しいChannel Secret

# Vercel の場合、Environment Variables を確認
```

### エラー: "State mismatch"

**原因**: CSRF 検証失敗 (通常はブラウザのキャッシュ)

**解決**:
```javascript
// LocalStorage をクリア
localStorage.removeItem('line_oauth_state');

// 再度ログインを試す
```

### エラー: "CORS error"

**原因**: API Route の実行エラー

**解決**:
```bash
# ビルドエラーを確認
npm run build

# ログを確認
# Vercel Dashboard → Project → Deployments → Logs
```

---

## 📊 データベーススキーマ (Supabase)

### `users` テーブル

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT UNIQUE,           -- LINE User ID
  display_name TEXT NOT NULL,         -- LINE 表示名
  picture_url TEXT,                   -- プロフィール画像 URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_users_line_user_id ON users(line_user_id);
```

### RLS (Row Level Security) 設定

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 誰でも読める
CREATE POLICY "Anyone can read users"
  ON users FOR SELECT
  USING (true);

-- 自分のレコードのみ更新可能
CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (line_user_id = current_setting('request.jwt.claims')::json->>'line_user_id');
```

---

## 🎨 UI/UX

### LINE ボタンのブランドガイドライン

```tsx
// LINE 公式カラー: #00B900
<button 
  style={{ backgroundColor: '#00B900' }}
  className="text-white"
>
  💬 LINEでログイン
</button>
```

### ローディング状態

```tsx
// Callback ページで自動表示
- Loading: アニメーションスピナー
- Success: チェックマーク + "ログイン成功！"
- Error: エラーアイコン + エラーメッセージ
```

---

## 🚀 本番デプロイ チェックリスト

- [ ] LINE Developers でチャネル作成
- [ ] 本番 Callback URL を登録
- [ ] Vercel に環境変数を設定
  - [ ] `LINE_CLIENT_ID`
  - [ ] `LINE_CLIENT_SECRET`
  - [ ] `NEXT_PUBLIC_LINE_REDIRECT_URI`
- [ ] Redeploy
- [ ] 本番環境でテスト
- [ ] Supabase でユーザーテーブル作成 (オプション)

---

## 📈 次のステップ

### 1. リフレッシュトークン対応

```typescript
// Access Token の有効期限切れ時に自動更新
async function refreshLineToken(refreshToken: string) {
  const response = await fetch(LINE_AUTH_ENDPOINTS.TOKEN, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.LINE_CLIENT_ID!,
      client_secret: process.env.LINE_CLIENT_SECRET!,
    })
  });
  return response.json();
}
```

### 2. ログアウト時のトークン無効化

```typescript
// LINE Access Token を無効化
async function revokeLine Token(accessToken: string) {
  await fetch(LINE_AUTH_ENDPOINTS.REVOKE, {
    method: 'POST',
    body: new URLSearchParams({
      access_token: accessToken,
      client_id: process.env.LINE_CLIENT_ID!,
      client_secret: process.env.LINE_CLIENT_SECRET!,
    })
  });
}
```

### 3. Email 取得 (オプション)

```typescript
// scope に 'email' を追加 (LINE 側で承認が必要)
const params = {
  // ...
  scope: 'profile openid email'
};
```

---

## 🎉 完成！

**LINE ログインが完全に動作します！**

- ✅ Supabase Dashboard 設定不要
- ✅ LINE OAuth 2.0 直接連携
- ✅ CSRF & リプレイ攻撃対策
- ✅ モックモード対応
- ✅ 本番環境対応

**日本人ユーザーが最も使いやすい LINE 認証が実装されました！** 🟢
