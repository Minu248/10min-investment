# Supabase 설정 완전 가이드

## 📋 목차
1. [프로젝트 생성](#1-프로젝트-생성)
2. [데이터베이스 설정](#2-데이터베이스-설정)
3. [Storage 설정](#3-storage-설정)
4. [환경변수 설정](#4-환경변수-설정)
5. [연결 테스트](#5-연결-테스트)
6. [문제 해결](#6-문제-해결)

---

## 1. 프로젝트 생성

### 1.1 Supabase 계정 생성
1. [Supabase](https://supabase.com) 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인

### 1.2 새 프로젝트 생성
1. "New Project" 버튼 클릭
2. **Organization**: 선택 또는 새로 생성
3. **Name**: `10min-investment` (또는 원하는 이름)
4. **Database Password**: 안전한 비밀번호 설정 (기억해두세요!)
5. **Region**: 가까운 지역 선택 (예: `Southeast Asia (Singapore)`)
6. **Pricing Plan**: Free tier 선택
7. "Create new project" 클릭

### 1.3 프로젝트 초기화 대기
- 프로젝트 생성 완료까지 2-3분 소요
- "Project is ready" 메시지 확인

---

## 2. 데이터베이스 설정

### 2.1 SQL Editor에서 테이블 생성
1. 왼쪽 사이드바 → "SQL Editor" 클릭
2. "New query" 클릭
3. `supabase-setup.sql` 파일의 내용을 복사하여 붙여넣기
4. "Run" 버튼 클릭

### 2.2 테이블 생성 확인
1. 왼쪽 사이드바 → "Table Editor" 클릭
2. `podcasts` 테이블이 생성되었는지 확인
3. 테이블 구조 확인:
   - `id` (UUID, Primary Key)
   - `title` (Text, Not Null)
   - `summary` (Text)
   - `audio_url` (Text, Not Null)
   - `duration` (Integer, Not Null)
   - `file_size` (Integer)
   - `file_name` (Text)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

---

## 3. Storage 설정

### 3.1 Storage 버킷 생성

#### 방법 A: SQL Editor 사용 (권장)
1. SQL Editor에서 새 쿼리 생성
2. `supabase-storage-setup.sql` 파일의 내용 실행
3. 실행 결과 확인

#### 방법 B: 대시보드에서 수동 생성
1. 왼쪽 사이드바 → "Storage" 클릭
2. "New bucket" 버튼 클릭
3. 설정:
   - **Name**: `podcast-audio`
   - **Public bucket**: ✅ 체크
4. "Create bucket" 클릭

### 3.2 RLS 정책 설정 확인
1. Storage → `podcast-audio` 버킷 클릭
2. "Policies" 탭 클릭
3. 다음 정책들이 있는지 확인:
   - `Public Access` (SELECT)
   - `Authenticated users can upload` (INSERT)
   - `Authenticated users can delete` (DELETE)

### 3.3 정책이 없다면 수동 생성
각 정책을 "New Policy"로 생성:

#### 읽기 정책
```sql
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'podcast-audio');
```

#### 업로드 정책
```sql
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'podcast-audio');
```

#### 삭제 정책
```sql
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'podcast-audio');
```

---

## 4. 환경변수 설정

### 4.1 API 키 확인
1. 왼쪽 사이드바 → "Settings" 클릭
2. "API" 탭 클릭
3. 다음 정보 복사:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4.2 .env.local 파일 생성
프로젝트 루트에 `.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4.3 실제 값으로 교체
- `your-project-id` → 실제 프로젝트 ID
- `your-anon-key-here` → 실제 anon public 키

---

## 5. 연결 테스트

### 5.1 개발 서버 실행
```bash
npm run dev
```

### 5.2 브라우저에서 테스트
1. [http://localhost:3000](http://localhost:3000) 접속
2. 브라우저 개발자 도구 열기 (F12)
3. Console 탭에서 다음 실행:

```javascript
// 연결 테스트 함수 로드
import('/src/lib/supabase/test-connection.ts').then(module => {
  module.runConnectionTest()
})
```

### 5.3 예상 결과
```
🔍 Supabase 연결 테스트 시작...
✅ 데이터베이스 연결 성공
✅ Storage 연결 성공
🎉 모든 연결이 정상입니다!
```

---

## 6. 문제 해결

### 6.1 환경변수 오류
**증상**: "Missing Supabase environment variables" 오류

**해결방법**:
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 환경변수 이름이 정확한지 확인
3. 개발 서버 재시작: `npm run dev`

### 6.2 데이터베이스 연결 오류
**증상**: "데이터베이스 연결 실패" 오류

**해결방법**:
1. API 키가 올바른지 확인
2. 프로젝트 URL이 정확한지 확인
3. Supabase 프로젝트가 활성 상태인지 확인

### 6.3 Storage 연결 오류
**증상**: "Storage 연결 실패" 오류

**해결방법**:
1. Storage 버킷이 생성되었는지 확인
2. RLS 정책이 올바르게 설정되었는지 확인
3. 버킷 이름이 `podcast-audio`인지 확인

### 6.4 파일 업로드 오류
**증상**: 파일 업로드 시 오류

**해결방법**:
1. 파일 크기가 100MB 이하인지 확인
2. 파일 형식이 지원되는 형식인지 확인 (MP3, WAV, OGG, M4A)
3. Storage 정책에서 INSERT 권한이 있는지 확인

---

## 7. 추가 설정 (선택사항)

### 7.1 CORS 설정
외부 도메인에서 접근하려면 CORS 설정 필요:

1. Settings → API → CORS
2. 허용할 도메인 추가 (예: `http://localhost:3000`)

### 7.2 파일 크기 제한 조정
기본 100MB 제한을 변경하려면:

1. `src/lib/supabase/storage.ts` 파일에서 `maxSize` 값 수정
2. Supabase Storage 설정에서도 확인

### 7.3 CDN 설정
성능 향상을 위해 CDN 설정:

1. Settings → API → CDN
2. CDN URL 확인 및 사용

---

## 8. 완료 확인

모든 설정이 완료되면:

1. ✅ Supabase 프로젝트 생성
2. ✅ 데이터베이스 테이블 생성
3. ✅ Storage 버킷 생성
4. ✅ RLS 정책 설정
5. ✅ 환경변수 설정
6. ✅ 연결 테스트 성공
7. ✅ 파일 업로드 테스트 성공

이제 `/admin` 페이지에서 오디오 파일을 업로드하고 팟캐스트를 등록할 수 있습니다! 