# 10min Investment Podcast

자동으로 금융 뉴스를 수집하고 요약하여 10분 팟캐스트로 제공하는 서비스입니다.

## 기술 스택

- **Framework**: Next.js with TypeScript
- **Deployment**: Vercel
- **Backend-as-a-Service**: Supabase (Database, Auth, Storage)
<<<<<<< HEAD
=======
- **Styling**: Tailwind CSS
>>>>>>> master

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   └── cron/          # 크론 작업 API
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
├── lib/                   # 공유 유틸리티
│   └── supabaseClient.ts  # Supabase 클라이언트
└── sql/                   # 데이터베이스 스키마
    └── schema.sql         # 테이블 생성 스크립트
```

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
<<<<<<< HEAD
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
=======
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Generative AI
GEMINI_API_KEY=your_gemini_api_key
>>>>>>> master
```

## 개발 서버 실행

```bash
npm run dev
```

## 배포

<<<<<<< HEAD
이 프로젝트는 Vercel을 통해 자동 배포됩니다. GitHub 저장소에 푸시하면 자동으로 빌드 및 배포가 진행됩니다.
=======
이 프로젝트는 Vercel을 통해 자동 배포됩니다. GitHub에 코드를 푸시하면 자동으로 빌드 및 배포가 진행됩니다.
>>>>>>> master

## 데이터베이스 설정

1. Supabase 프로젝트를 생성합니다.
2. `sql/schema.sql` 파일의 내용을 Supabase SQL 편집기에서 실행합니다.
3. 환경 변수를 설정합니다.

<<<<<<< HEAD
## API 엔드포인트

- `GET /api/cron/generate-podcast`: 팟캐스트 생성 크론 작업 (Vercel Cron Job용)

## 라이선스

MIT License
=======
## Storage 설정

1. Supabase 대시보드 → Storage에서 새 버킷을 생성합니다.
2. 버킷 이름: `podcasts`
3. 공개 액세스 설정: `true` (팟캐스트 파일 공개 접근 허용)
4. RLS 정책 설정:
   ```sql
   -- 공개 읽기 정책
   CREATE POLICY "Public read access" ON storage.objects
     FOR SELECT USING (bucket_id = 'podcasts');
   
   -- 인증된 사용자 쓰기 정책
   CREATE POLICY "Authenticated users can upload" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'podcasts' AND auth.role() = 'authenticated');
   ```

## 크론 작업

팟캐스트 자동 생성은 Vercel Cron Jobs를 통해 `app/api/cron/generate-podcast/route.ts` 엔드포인트를 호출합니다.
>>>>>>> master
