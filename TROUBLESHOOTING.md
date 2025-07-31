# 파일 업로드 문제 해결 가이드

## 🔍 문제 진단

파일 업로드 실패 시 다음 단계를 따라 문제를 진단하세요.

### 1. 환경 변수 확인

프로젝트 루트에 `.env.local` 파일이 있는지 확인하고, 다음 내용이 올바르게 설정되어 있는지 확인하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**확인 방법:**
- Supabase 대시보드 → Settings → API에서 URL과 Anon Key 복사
- URL은 `https://`로 시작하고 `.supabase.co`로 끝나야 함
- Anon Key는 `eyJ`로 시작하는 JWT 토큰 형식이어야 함

### 2. Supabase Storage 설정 확인

Supabase SQL Editor에서 다음 쿼리를 실행하여 Storage 설정을 확인하세요:

```sql
-- 버킷 존재 확인
SELECT * FROM storage.buckets WHERE id = 'podcast-audio';

-- 정책 확인
SELECT * FROM storage.policies WHERE table_name = 'objects';
```

### 3. 브라우저 콘솔 확인

개발자 도구(F12) → Console 탭에서 다음 정보를 확인하세요:

- 환경 변수 로딩 메시지
- Supabase 클라이언트 초기화 메시지
- 파일 업로드 과정의 상세 로그
- 구체적인 에러 메시지

## 🛠️ 일반적인 문제와 해결 방법

### 문제 1: "Missing Supabase environment variables"

**원인:** 환경 변수가 설정되지 않음

**해결 방법:**
1. `.env.local` 파일 생성
2. Supabase 프로젝트 정보 입력
3. 개발 서버 재시작

### 문제 2: "podcast-audio 버킷이 존재하지 않습니다"

**원인:** Storage 버킷이 생성되지 않음

**해결 방법:**
1. Supabase 대시보드 → Storage로 이동
2. "New bucket" 클릭
3. Bucket name: `podcast-audio`
4. Public bucket 체크
5. Create bucket 클릭

또는 SQL Editor에서 `supabase-storage-setup.sql` 실행

### 문제 3: "파일 업로드 권한이 없습니다"

**원인:** Storage 정책이 올바르게 설정되지 않음

**해결 방법:**
1. Supabase 대시보드 → Storage → podcast-audio → Policies
2. 다음 정책들이 있는지 확인:
   - "Public Access" (SELECT)
   - "Authenticated users can upload" (INSERT)
   - "Authenticated users can delete" (DELETE)
   - "Authenticated users can update" (UPDATE)

### 문제 4: "파일 크기가 너무 큽니다"

**원인:** 파일이 100MB 제한을 초과

**해결 방법:**
1. 파일 크기 확인 (100MB 이하)
2. 필요시 파일 압축 또는 분할
3. 지원 형식 확인: MP3, WAV, OGG, M4A

### 문제 5: "지원하지 않는 오디오 파일 형식입니다"

**원인:** 지원되지 않는 파일 형식

**해결 방법:**
1. 지원 형식으로 변환: MP3, WAV, OGG, M4A
2. 온라인 변환 도구 사용
3. 파일 확장자 확인

## 🔧 추가 디버깅

### 연결 테스트

관리자 페이지(`/admin`)에서 연결 상태를 확인할 수 있습니다:
- ✅ 연결됨: 정상
- ❌ 연결 실패: 환경 변수나 설정 문제

### 수동 테스트

브라우저 콘솔에서 다음 명령어로 수동 테스트:

```javascript
// 연결 테스트
import { testSupabaseConnection } from '@/lib/supabase/client'
testSupabaseConnection().then(console.log)

// Storage 버킷 확인
import { supabase } from '@/lib/supabase/client'
supabase.storage.listBuckets().then(console.log)
```

## 📞 지원

문제가 지속되면 다음 정보를 포함하여 문의하세요:

1. 브라우저 콘솔의 전체 에러 메시지
2. 환경 변수 설정 상태 (민감한 정보 제외)
3. Supabase 프로젝트 설정 스크린샷
4. 업로드하려는 파일의 크기와 형식

## 🔄 재시작 체크리스트

문제 해결 후 다음 순서로 재시작하세요:

1. `.env.local` 파일 저장
2. 개발 서버 중지 (`Ctrl+C`)
3. `npm run dev`로 서버 재시작
4. 브라우저 캐시 삭제 (F12 → Network → Disable cache)
5. 페이지 새로고침
6. 연결 상태 확인
7. 파일 업로드 테스트 