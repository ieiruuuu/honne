# 📸 게시글 이미지 업로드 기능 구현 완료! ✅

게시글 작성 시 이미지를 첨부할 수 있는 기능이 성공적으로 구현되었습니다!

---

## 📋 **구현된 기능**

### 1️⃣ **이미지 선택 & 미리보기**
- ✅ `input type="file"`로 이미지 선택
- ✅ 선택 즉시 **미리보기(Preview)** 표시
- ✅ 파일 형식 제한: **JPG, PNG, WEBP**
- ✅ 파일 크기 제한: **최대 5MB**
- ✅ 이미지 삭제 버튼 (휴지통 아이콘)

### 2️⃣ **Supabase Storage 업로드**
- ✅ 게시글 저장 시 이미지 **자동 업로드**
- ✅ 업로드 중 로딩 상태 표시 ("アップロード中...")
- ✅ 업로드 실패 시 에러 메시지 표시
- ✅ Public URL 자동 생성 및 `posts` 테이블에 저장

### 3️⃣ **이미지 표시**
- ✅ **게시글 목록 (PostCard)**: 썸네일 형태로 표시
- ✅ **게시글 상세 (PostDetailPage)**: 큰 이미지로 표시
- ✅ 이미지 크기 자동 조정 (`max-h-96`)
- ✅ Lazy loading 적용 (성능 최적화)

### 4️⃣ **에러 핸들링 & 유효성 검사**
- ✅ 파일 형식 체크
- ✅ 파일 크기 체크
- ✅ 상세한 에러 메시지 표시
- ✅ 업로드 중 중복 제출 방지

---

## 🚀 **설치 및 실행 방법**

### **Step 1: Supabase Storage 버킷 생성**

1. **Supabase Dashboard** 접속
   - `https://supabase.com/dashboard` → 프로젝트 선택

2. **Storage 메뉴** 열기
   - 좌측 메뉴 → **"Storage"** 클릭

3. **버킷 생성**
   - **"Create bucket"** 버튼 클릭
   - **Bucket name**: `post-images`
   - **Public bucket**: ✅ **체크** (중요!)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
   - **"Create bucket"** 클릭

4. **RLS 정책 설정**
   - SQL Editor → New query
   - `supabase_image_upload.sql` 파일 내용 복사 & 실행

---

### **Step 2: posts 테이블에 image_url 컬럼 추가**

1. **SQL Editor** 열기
   - Supabase Dashboard → **"SQL Editor"** 클릭

2. **New query** 클릭

3. **SQL 실행**
   ```sql
   ALTER TABLE posts 
   ADD COLUMN IF NOT EXISTS image_url TEXT;
   ```

4. **확인**
   - Table Editor → `posts` 테이블 → `image_url` 컬럼 추가됨

---

### **Step 3: 로컬 서버 재시작**

터미널에서 다음 명령어를 실행하세요:

```bash
# Node 프로세스 강제 종료
pkill -9 node

# 빌드 캐시 삭제
rm -rf .next

# 서버 재시작
npm run dev
```

---

## 📁 **생성된 파일**

### 1. **`supabase_image_upload.sql`**
   - Storage 버킷 설정 SQL
   - `posts` 테이블에 `image_url` 컬럼 추가
   - RLS 정책 설정

### 2. **`src/lib/imageUpload.ts`**
   - 이미지 업로드 유틸리티 함수
   - `validateImageFile()`: 파일 유효성 검사
   - `uploadPostImage()`: Supabase Storage에 업로드
   - `deletePostImage()`: 이미지 삭제
   - `getImagePreviewUrl()`: 미리보기 URL 생성

### 3. **업데이트된 파일**
   - `src/app/write/page.tsx`
     - 이미지 선택 UI 추가
     - 미리보기 표시
     - 업로드 로직 통합
   
   - `src/features/feed/hooks/useCreatePost.ts`
     - `image_url` 파라미터 추가
     - 게시글 생성 시 이미지 URL 저장
   
   - `src/features/posts/PostCard.tsx`
     - 게시글 목록에서 이미지 표시
   
   - `src/app/posts/[id]/page.tsx`
     - 게시글 상세에서 이미지 표시

---

## 🎨 **UI/UX 특징**

### **이미지 선택**
```
┌─────────────────────────────────────┐
│  画像を添付 (任意)                   │
│  ┌───────────────────────────────┐  │
│  │  📷  画像を選択               │  │ ← 클릭하여 선택
│  └───────────────────────────────┘  │
│  JPG、PNG、WEBP形式、最大5MB        │
└─────────────────────────────────────┘
```

### **이미지 미리보기**
```
┌─────────────────────────────────────┐
│  画像を添付 (任意)                   │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │    [미리보기 이미지]    🗑️   │  │ ← 삭제 버튼
│  │                               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### **업로드 중**
```
┌─────────────────────────────────────┐
│  画像を添付 (任意)                   │
│  ┌───────────────────────────────┐  │
│  │      ⏳                        │  │
│  │   アップロード中...            │  │ ← 로딩 표시
│  │                               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## ✅ **작동 방식**

### **1단계: 이미지 선택**
```typescript
const handleImageSelect = async (file: File) => {
  // 1. 유효성 검사
  const validation = validateImageFile(file);
  
  // 2. 미리보기 생성
  const previewUrl = await getImagePreviewUrl(file);
  
  // 3. 상태 업데이트
  setSelectedImage(file);
  setImagePreview(previewUrl);
};
```

### **2단계: 게시글 저장 시 업로드**
```typescript
const handleSubmit = async () => {
  // 1. 이미지 업로드 (선택된 경우)
  if (selectedImage) {
    const uploadResult = await uploadPostImage(selectedImage, userId);
    uploadedImageUrl = uploadResult.url;
  }
  
  // 2. 게시글 생성
  await createPost({
    content,
    nickname,
    category,
    image_url: uploadedImageUrl, // 이미지 URL 포함
  });
};
```

### **3단계: 이미지 표시**
```typescript
// PostCard & PostDetailPage
{post.image_url && (
  <img
    src={post.image_url}
    alt="投稿画像"
    className="w-full h-auto max-h-96 object-cover rounded-lg"
  />
)}
```

---

## 🔒 **보안 & RLS 정책**

### **Storage RLS 정책**

| 정책 이름 | 타입 | 권한 | 조건 |
|----------|------|------|------|
| `Post images are publicly accessible` | SELECT | 모두 | `bucket_id = 'post-images'` |
| `Authenticated users can upload post images` | INSERT | 인증된 사용자 | `bucket_id = 'post-images'` |
| `Users can delete own post images` | DELETE | 인증된 사용자 | 자신이 업로드한 이미지만 |

---

## 🧪 **테스트**

### **1. 이미지 선택 테스트**
1. 게시글 작성 페이지 접속 (`/write`)
2. **"画像を選択"** 버튼 클릭
3. JPG/PNG/WEBP 이미지 선택
4. 미리보기가 표시되는지 확인
5. 휴지통 아이콘 클릭 → 이미지 삭제 확인

### **2. 파일 크기 제한 테스트**
1. 5MB 이상의 이미지 선택 시도
2. 에러 메시지 표시 확인: "画像サイズは5MB以下にしてください"

### **3. 파일 형식 제한 테스트**
1. GIF, BMP 등 지원하지 않는 형식 선택 시도
2. 에러 메시지 표시 확인: "JPG、PNG、WEBP形式の画像のみアップロードできます"

### **4. 업로드 & 표시 테스트**
1. 이미지를 선택하고 게시글 작성
2. **"投稿"** 버튼 클릭
3. 업로드 중 로딩 표시 확인
4. 홈 화면으로 이동 후 게시글에 이미지 표시 확인
5. 게시글 클릭 → 상세 페이지에서 이미지 표시 확인

---

## 🐛 **문제 해결 (Troubleshooting)**

### **문제 1: "post-images 버킷이 없습니다" 에러**

**원인**: Storage 버킷이 생성되지 않았습니다.

**해결**:
1. Supabase Dashboard → Storage
2. **"Create bucket"** 클릭
3. Bucket name: `post-images`
4. **Public bucket** 체크 ✅

---

### **문제 2: "image_url 컬럼이 없습니다" 에러**

**원인**: `posts` 테이블에 `image_url` 컬럼이 없습니다.

**해결**:
```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;
```

---

### **문제 3: 이미지 업로드 실패 (403 Forbidden)**

**원인**: RLS 정책이 설정되지 않았습니다.

**해결**:
- `supabase_image_upload.sql` 파일의 RLS 정책 부분을 SQL Editor에서 실행하세요.

---

### **문제 4: 이미지가 표시되지 않음**

**원인**: Public bucket이 아니거나 URL이 잘못되었습니다.

**해결**:
1. Storage → `post-images` 버킷 → Settings
2. **"Public bucket"** 옵션이 활성화되어 있는지 확인
3. 브라우저 개발자 도구 → Network 탭에서 이미지 URL 확인

---

## 💡 **추가 기능 (선택 사항)**

### **1. 이미지 압축**
- 업로드 전에 클라이언트에서 이미지 압축
- 라이브러리: `browser-image-compression`

### **2. 다중 이미지 업로드**
- 최대 3-5장까지 이미지 첨부 가능
- 이미지 갤러리 형태로 표시

### **3. 이미지 편집**
- 크롭, 회전, 필터 적용
- 라이브러리: `react-image-crop`

### **4. 이미지 삭제 기능**
- 게시글 삭제 시 연관된 이미지도 자동 삭제
- `deletePostImage()` 함수 활용

---

## 🎉 **완료!**

이미지 업로드 기능이 성공적으로 구현되었습니다!

**다음 작업을 시작하세요:**
1. ✅ `supabase_image_upload.sql` 실행
2. ✅ Storage 버킷 생성 (`post-images`)
3. ✅ 서버 재시작
4. ✅ 게시글 작성 시 이미지 첨부 테스트

**문제가 있으면 위의 "문제 해결" 섹션을 참고하세요!** 📸✨
