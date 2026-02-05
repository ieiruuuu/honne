# 🚨 로그인 400 에러 수정 가이드

## ❌ 문제

**Console 에러:**
```
POST https://qrpjhqsobqnrhaifbfbp.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)
```

**원인:**
Supabase는 기본적으로 **이메일 확인(Email Verification)**이 필수로 설정되어 있습니다.
회원가입 후 이메일을 확인하지 않으면 로그인이 실패합니다.

---

## ✅ 해결 방법 (2가지 옵션)

### 옵션 1: 이메일 확인 비활성화 (개발 환경 - 권장)

이메일 확인을 끄면 즉시 로그인할 수 있습니다.

#### Step 1: Supabase Dashboard 접속
```
https://supabase.com
→ honne 프로젝트 클릭
```

#### Step 2: Authentication 설정으로 이동
```
왼쪽 메뉴:
🔒 Authentication
  ├─ Users
  ├─ Policies
  └─ Providers
  
클릭: ⚙️ URL Configuration (또는 Settings)
```

#### Step 3: Email Auth 설정 수정
```
1. "Email" 섹션 찾기

2. "Enable email confirmations" 찾기
   ┌─────────────────────────────────────┐
   │  Enable email confirmations         │
   │  [✓] Users need to confirm email   │  ← 이 체크박스
   └─────────────────────────────────────┘

3. 체크박스 해제 (✓ → ☐)

4. "Save" 버튼 클릭
```

#### Step 4: 테스트
```
1. 브라우저 새로고침 (Cmd+Shift+R)
2. 회원가입 다시 시도
3. 이메일 확인 없이 즉시 로그인됨
```

---

### 옵션 2: 이메일 확인 사용 (프로덕션 환경)

이메일 확인을 사용하려면 SMTP를 설정해야 합니다.

#### Step 1: 테스트용 이메일 확인
```
1. 회원가입 시 사용한 이메일 확인
2. Supabase에서 보낸 확인 이메일 열기
3. "Confirm your email" 링크 클릭
4. 브라우저로 돌아가서 로그인
```

#### Step 2: SMTP 설정 (선택사항)
```
Supabase Dashboard:
1. Settings → Auth
2. "SMTP Settings" 섹션
3. 이메일 서비스 설정 (Gmail, SendGrid 등)
```

---

## 🚀 **권장: 옵션 1 (이메일 확인 비활성화)**

개발 단계에서는 이메일 확인을 끄는 것이 훨씬 편합니다!

### 빠른 가이드:

```
1. https://supabase.com
   ↓
2. honne 프로젝트
   ↓
3. 왼쪽 메뉴: Authentication
   ↓
4. 상단 탭: Providers (또는 Settings)
   ↓
5. Email Auth 섹션 찾기
   ↓
6. "Enable email confirmations" 체크 해제
   ↓
7. Save
   ↓
8. 브라우저 새로고침 & 회원가입 재시도
```

---

## ✅ 확인 방법

### 성공 시:
```
1. 회원가입 즉시 로그인됨
2. Console에 400 에러 없음
3. "✅ Session found. User ID: ..." 표시
4. 우측 상단에 로그인 상태 표시
```

### 실패 시:
```
여전히 400 에러:
1. Supabase 설정 다시 확인
2. "Enable email confirmations" 체크 해제 확인
3. Save 버튼 클릭 확인
4. 브라우저 완전 새로고침
```

---

## 🐛 여전히 400 에러가 나면

### 다른 가능한 원인:

#### 1. 잘못된 비밀번호
```
해결: 비밀번호 최소 6자 이상 입력
```

#### 2. 이미 존재하는 이메일
```
해결: 다른 이메일로 회원가입
또는 기존 이메일로 로그인
```

#### 3. Supabase RLS 정책 문제
```
확인:
1. Supabase Dashboard
2. Table Editor → auth.users
3. RLS 정책 확인

해결:
- 필요 시 supabase_schema.sql 재실행
```

---

## 📋 체크리스트

```
□ Supabase 접속
□ Authentication → Providers (또는 Settings)
□ Email Auth 섹션 찾기
□ "Enable email confirmations" 체크 해제
□ Save 버튼 클릭
□ 브라우저 새로고침
□ 회원가입 재시도
□ 로그인 성공 확인
□ Console에 400 에러 없음
```

---

## 🎉 완료 후

```
✅ 이메일 확인 없이 즉시 로그인
✅ 400 에러 사라짐
✅ 회원가입 즉시 가능
✅ 빠른 개발 가능
```

---

**지금 바로 Supabase에서 이메일 확인을 비활성화하세요!** 🚀

완료하시면 알려주세요! 😊
