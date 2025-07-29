-- 10min Investment Podcast 데이터베이스 스키마
-- 이 스크립트는 Supabase SQL 편집기에서 실행하세요

-- Podcasts 테이블 생성 - 에피소드 정보를 저장
CREATE TABLE Podcasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL, -- 예: "MM/DD Financial News Briefing"
    episode_date DATE NOT NULL,
    summary_text TEXT, -- 웹 플레이어용 텍스트 요약
    script_json JSONB, -- 두 명의 스피커를 위한 구조화된 스크립트, 자막에 유용
    audio_url TEXT, -- Supabase Storage의 MP3 파일 URL
    duration_seconds INTEGER, -- 총 오디오 길이 (초)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_podcasts_episode_date ON Podcasts(episode_date DESC);
CREATE INDEX idx_podcasts_created_at ON Podcasts(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE Podcasts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 설정
CREATE POLICY "Allow public read access" ON Podcasts
    FOR SELECT USING (true);

-- 인증된 사용자만 쓰기 가능하도록 정책 설정
CREATE POLICY "Allow authenticated insert" ON Podcasts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON Podcasts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON Podcasts
    FOR DELETE USING (auth.role() = 'authenticated'); 