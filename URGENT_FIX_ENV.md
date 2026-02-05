# 🚨 긴급 수정 필요: .env.local 파일

## ❌ 현재 문제

`.env.local` 파일의 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 **잘못된 키**입니다!

**현재 (❌ 잘못됨):**
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_wCJaxubu554iZv3UDQYTFQ_vzd38QDE
```

이것은 **Realtime용 Publishable 키**이며, **anon public 키가 아닙니다**!

---

## ✅ 올바른 수정 방법

### 1. Supabase에서 올바른 키 복사

```
1. https://supabase.com 접속
2. honne 프로젝트 클릭
3. Settings → API
4. 아래로 스크롤하여 "Project API keys" 섹션 찾기
5. "anon public" 키 복사 (eyJ로 시작하는 긴 문자열)
```

**올바른 키의 특징:**
- `eyJ`로 시작합니다
- 매우 긴 문자열입니다 (200자 이상)
- JWT 토큰 형식입니다

**잘못된 키의 특징:**
- `sb_publishable_`로 시작 ❌
- 너무 짧음 ❌

---

### 2. VS Code에서 .env.local 수정

#### 파일 열기:
```
Cmd + P → ".env.local" → Enter
```

#### 수정:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qrpjhqsobqnrhaifbfbp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# ↑ 여기에 Supabase에서 복사한 anon public 키를 붙여넣으세요!

# LINE Login OAuth 2.0 Configuration
LINE_CLIENT_ID=2009037222
LINE_CLIENT_SECRET=905d08a70bf4a2dd30171701b995b233
NEXT_PUBLIC_LINE_CLIENT_ID=2009037222
NEXT_PUBLIC_LINE_REDIRECT_URI=http://localhost:3000/auth/line/callback
```

#### 저장:
```
Cmd + S
```

---

### 3. 서버 재시작 ⚠️ 필수!

**터미널에서:**
```bash
rm -rf .next && npm run dev
```

---

## 🔍 올바른 키 확인 방법

### Supabase Dashboard에서:

1. **Settings → API 페이지로 이동**

2. **"Project API keys" 섹션 찾기**

3. **다음과 같은 구조를 찾으세요:**

```
┌─────────────────────────────────────┐
│  anon                               │  ← 이 라벨 확인
│  public                             │  ← "public" 표시 확인
│  ┌───────────────────────────────┐ │
│  │ eyJhbGciOiJIUzI1NiIsInR5cCI...│ │  ← eyJ로 시작
│  │ ...JWT 토큰...                 │ │  ← 매우 긴 문자열
│  └───────────────────────────────┘ │
│  [복사 버튼]                        │  ← 이 버튼 클릭
└─────────────────────────────────────┘
```

4. **복사 버튼 클릭** → 메모장에 붙여넣어 확인

---

## ✅ 수정 완료 후 확인

### 1. 터미널 확인
```
서버 시작 시 다음이 표시되어야 합니다:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 Supabase環境変数チェック
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: https://qrpjhqsobqnrhaifbfbp...
🔑 Key: eyJhbGciOiJIUzI1NiIsInR5cCI...  ← eyJ로 시작해야 함!
✅ 設定状態: ✓ 正常
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. 브라우저 새로고침
```
http://localhost:3000
Cmd + Shift + R
```

### 3. F12 → Console 확인
```
✅ "Supabase is not configured" 경고 사라짐
✅ Mock user ID 사라짐
✅ 로딩 무한 루프 해결
```

### 4. 글쓰기 테스트
```
1. 글쓰기 페이지 이동
2. 내용 입력
3. 제출
4. "✅ Post created successfully" 확인
5. 홈 화면에서 게시물 확인
```

---

## 🚨 만약 여전히 실패한다면

### 체크리스트:

```
□ anon public 키를 복사했나요? (eyJ로 시작)
□ service_role 키를 복사하지 않았나요?
□ publishable 키를 복사하지 않았나요?
□ .env.local 파일을 저장했나요? (Cmd+S)
□ 서버를 재시작했나요? (rm -rf .next && npm run dev)
□ 브라우저를 완전히 새로고침했나요? (Cmd+Shift+R)
```

---

## 📸 참고 이미지

**올바른 키 위치:**

```
Settings → API → 아래로 스크롤

┌─────────────────────────────────────┐
│  Project API keys                   │
│                                     │
│  [anon] [public]                    │  ← 이 섹션!
│  eyJhbGciOiJIUzI1NiIsInR5cCI6...   │
│  [Copy]                             │
│                                     │
│  [service_role] [secret]            │  ← 이건 아님!
│  eyJhbGciOiJIUzI1NiIsInR5cCI6...   │
└─────────────────────────────────────┘
```

---

## 📞 여전히 안 되면

다음 정보를 알려주세요:

1. 터미널에 표시된 메시지 (전체 복사)
2. 브라우저 Console의 에러 메시지 (F12)
3. 복사한 키가 `eyJ`로 시작하는지 확인
4. 키의 길이 (200자 이상이어야 함)

---

**지금 바로 Supabase에서 올바른 anon public 키를 복사하세요!** 🚀
