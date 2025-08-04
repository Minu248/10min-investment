import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경 변수 검증
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  throw new Error('NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.')
}

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.')
}

// URL 형식 검증
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('Invalid Supabase URL format:', supabaseUrl)
  throw new Error('올바르지 않은 Supabase URL 형식입니다.')
}

// Anon Key 형식 검증 (JWT 토큰 형식)
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.error('Invalid Supabase Anon Key format')
  throw new Error('올바르지 않은 Supabase Anon Key 형식입니다.')
}

console.log('Supabase client initializing with URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  storage: {
    // Storage 관련 설정
  }
})

// 연결 테스트 함수
export async function testSupabaseConnection() {
  try {
    const { error } = await supabase.from('podcasts').select('count').limit(1)
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    console.log('Supabase connection test successful')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}

// 팟캐스트 타입 정의
export interface Podcast {
  id: string
  title: string
  summary: string
  audio_url: string
  duration: number
  file_size?: number
  file_name?: string
  created_at: string
  updated_at: string
}

// 새 팟캐스트 등록용 타입
export interface CreatePodcastData {
  title: string
  summary: string
  audio_url: string
  duration: number
  file_size?: number
  file_name?: string
} 