-- 10min Investment Podcast Database Schema
-- 이 스크립트는 Supabase SQL 편집기에서 실행해야 합니다.

-- Create the Podcasts table to store episode information
CREATE TABLE Podcasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL, -- e.g., "MM/DD Financial News Briefing"
    episode_date DATE NOT NULL,
    summary_text TEXT, -- Text summary for the web player
    script_json JSONB, -- Structured script for two speakers, useful for subtitles
    audio_url TEXT, -- URL of the MP3 file in Supabase Storage
    duration_seconds INTEGER, -- Total audio duration
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on episode_date for faster queries
CREATE INDEX idx_podcasts_episode_date ON Podcasts(episode_date);

-- Create an index on created_at for chronological ordering
CREATE INDEX idx_podcasts_created_at ON Podcasts(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE Podcasts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public read access to podcasts
CREATE POLICY "Allow public read access to podcasts" ON Podcasts
    FOR SELECT USING (true);

-- Create a policy that allows authenticated users to insert podcasts
CREATE POLICY "Allow authenticated users to insert podcasts" ON Podcasts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to update podcasts
CREATE POLICY "Allow authenticated users to update podcasts" ON Podcasts
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to delete podcasts
CREATE POLICY "Allow authenticated users to delete podcasts" ON Podcasts
    FOR DELETE USING (auth.role() = 'authenticated'); 