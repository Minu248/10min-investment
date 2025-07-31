-- ========================================
-- Supabase Storage 설정 가이드
-- ========================================
-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- 1. Storage 버킷 생성 (오디오 파일용)
-- public: true로 설정하여 모든 사용자가 파일에 접근 가능
INSERT INTO storage.buckets (id, name, public) 
VALUES ('podcast-audio', 'podcast-audio', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage 정책 설정
-- 모든 사용자가 파일을 읽을 수 있도록 설정
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'podcast-audio');

-- 인증된 사용자만 파일을 업로드할 수 있도록 설정
-- 실제 운영에서는 관리자 인증을 추가해야 합니다
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'podcast-audio');

-- 인증된 사용자만 파일을 삭제할 수 있도록 설정
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'podcast-audio');

-- 파일 업데이트 정책 추가
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'podcast-audio');

-- 3. 버킷 설정 업데이트 (파일 크기 제한 등)
UPDATE storage.buckets 
SET file_size_limit = 52428800, -- 50MB (Supabase 기본 제한)
    allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
WHERE id = 'podcast-audio';

-- 4. CORS 설정 (오디오 재생을 위해)
-- Storage 버킷에 CORS 정책 추가
INSERT INTO storage.cors (bucket_id, allowed_origins, allowed_methods, allowed_headers, max_age_seconds)
VALUES (
  'podcast-audio',
  ARRAY['*'], -- 모든 도메인 허용 (개발용)
  ARRAY['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  ARRAY['*'],
  3600
)
ON CONFLICT (bucket_id) DO UPDATE SET
  allowed_origins = EXCLUDED.allowed_origins,
  allowed_methods = EXCLUDED.allowed_methods,
  allowed_headers = EXCLUDED.allowed_headers,
  max_age_seconds = EXCLUDED.max_age_seconds;

-- 5. 확인 쿼리
-- 버킷이 제대로 생성되었는지 확인
SELECT * FROM storage.buckets WHERE id = 'podcast-audio';

-- CORS 설정 확인
SELECT * FROM storage.cors WHERE bucket_id = 'podcast-audio';

-- 정책 확인은 대시보드에서 확인하세요:
-- Storage → podcast-audio 버킷 → Policies 탭 

-- 6. 문제 해결을 위한 추가 설정
-- RLS가 활성화되어 있는지 확인
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 버킷이 존재하지 않는 경우를 위한 대체 생성
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'podcast-audio') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'podcast-audio', 
            'podcast-audio', 
            true, 
            52428800, -- 50MB (Supabase 기본 제한)
            ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
        );
    END IF;
END $$; 