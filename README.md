# 10분 재테크 팟캐스트

짧은 시간에 핵심만 담은 재테크 팟캐스트를 제공하는 웹 애플리케이션입니다.

## 주요 기능

- 🎧 **백그라운드 재생**: 페이지 이동 시에도 끊김 없는 오디오 재생
- 📱 **반응형 디자인**: 모바일과 데스크톱에서 최적화된 UI
- 🎵 **전역 오디오 플레이어**: 하단 고정 플레이어로 편리한 제어
- 📊 **Supabase 연동**: 실시간 데이터베이스 연동

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Audio**: HTML5 Audio API

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 Supabase 설정을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase-setup.sql` 파일의 내용을 실행하여 테이블 생성
3. 또는 다음 단계로 수동 설정:
   - Table Editor에서 새 테이블 생성
   - RLS (Row Level Security) 활성화
   - 적절한 정책 설정

### 4. Supabase Storage 설정

1. Supabase 대시보드에서 Storage 섹션으로 이동
2. `supabase-storage-setup.sql` 파일의 내용을 SQL Editor에서 실행
3. 또는 수동으로 Storage 버킷 생성:
   - 새 버킷 생성: `podcast-audio`
   - Public 버킷으로 설정
   - 적절한 RLS 정책 설정

### 5. 팟캐스트 등록

1. 개발 서버 실행 후 `/admin` 페이지 접속
2. **방법 1: 파일 직접 업로드**
   - 오디오 파일을 직접 선택하여 Supabase Storage에 업로드
   - 재생 시간 자동 감지
   - 파일 크기 및 형식 자동 검증
3. **방법 2: 외부 URL 사용**
   - 외부 호스팅 서비스의 URL 직접 입력
   - 수동으로 메타데이터 입력

### 6. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지
│   └── globals.css        # 글로벌 스타일
├── components/            # React 컴포넌트
│   ├── GlobalAudioPlayer.tsx  # 전역 오디오 플레이어
│   └── PodcastCard.tsx        # 팟캐스트 카드
├── lib/                   # 유틸리티 및 설정
│   └── supabase/          # Supabase 설정
└── store/                 # 상태 관리
    └── audioStore.ts      # 오디오 상태 관리
```

## 배포

이 프로젝트는 Vercel에 최적화되어 있습니다:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/10min-investment)

## 라이선스

MIT License
