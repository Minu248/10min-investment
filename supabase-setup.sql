-- 기존 테이블이 있다면 삭제
DROP TABLE IF EXISTS podcasts;

-- podcasts 테이블 생성
CREATE TABLE podcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  audio_url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  file_size INTEGER, -- 파일 크기 (bytes)
  file_name TEXT, -- 원본 파일명
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_podcasts_created_at ON podcasts(created_at DESC);
CREATE INDEX idx_podcasts_title ON podcasts(title);

-- RLS (Row Level Security) 설정
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 설정
CREATE POLICY "Allow public read access" ON podcasts
  FOR SELECT USING (true);

-- 모든 사용자가 쓰기 가능하도록 정책 설정 (개발용)
CREATE POLICY "Allow public insert" ON podcasts
  FOR INSERT WITH CHECK (true);

-- 모든 사용자가 업데이트 가능하도록 정책 설정 (개발용)
CREATE POLICY "Allow public update" ON podcasts
  FOR UPDATE USING (true);

-- 모든 사용자가 삭제 가능하도록 정책 설정 (개발용)
CREATE POLICY "Allow public delete" ON podcasts
  FOR DELETE USING (true);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 생성
CREATE TRIGGER update_podcasts_updated_at
  BEFORE UPDATE ON podcasts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 삽입 (테스트용)
INSERT INTO podcasts (title, summary, audio_url, duration, file_size, file_name) VALUES
(
  '재테크 첫걸음: 주식 투자 기초',
  '주식 투자를 처음 시작하는 분들을 위한 기초 가이드입니다. 주식이란 무엇인지, 어떻게 시작해야 하는지 알기 쉽게 설명합니다.',
  'https://example.com/audio/stock-basics.mp3',
  600, -- 10분
  10240000, -- 10MB
  'stock-basics.mp3'
),
(
  '부동산 투자 전략',
  '부동산 투자의 기본 원리와 다양한 투자 전략에 대해 알아봅니다. 리스크 관리와 수익 극대화 방법을 다룹니다.',
  'https://example.com/audio/real-estate-strategy.mp3',
  720, -- 12분
  15360000, -- 15MB
  'real-estate-strategy.mp3'
),
(
  '암호화폐 투자 가이드',
  '암호화폐 시장의 특징과 투자 시 주의사항을 다룹니다. 블록체인 기술의 이해부터 실전 투자 팁까지.',
  'https://example.com/audio/crypto-guide.mp3',
  540, -- 9분
  8192000, -- 8MB
  'crypto-guide.mp3'
); 