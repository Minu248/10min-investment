# 10min Investment Podcast

자동으로 금융 뉴스를 수집하고 요약하여 10분 팟캐스트로 제공하는 서비스입니다.

## 기술 스택

- **Framework**: Next.js with TypeScript
- **Deployment**: Vercel
- **Backend-as-a-Service**: Supabase (Database, Auth, Storage)

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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 개발 서버 실행

```bash
npm run dev
```

## 배포

이 프로젝트는 Vercel을 통해 자동 배포됩니다. GitHub 저장소에 푸시하면 자동으로 빌드 및 배포가 진행됩니다.

## 데이터베이스 설정

1. Supabase 프로젝트를 생성합니다.
2. `sql/schema.sql` 파일의 내용을 Supabase SQL 편집기에서 실행합니다.
3. 환경 변수를 설정합니다.

## API 엔드포인트

- `GET /api/cron/generate-podcast`: 팟캐스트 생성 크론 작업 (Vercel Cron Job용)

## 라이선스

MIT License
